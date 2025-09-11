import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ensureCorrelationId, createLogger, withSpan } from '../shared-lib/dist/index.js';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
// Minimal CORS for browser-based frontend
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});
app.use((req, _res, next) => { req.correlationId = ensureCorrelationId(req.headers['x-request-id']); next(); });
app.use((req, _res, next) => { req.logger = createLogger('workflow-service', req.correlationId); req.logger.info('request', { method: req.method, url: req.url }); next(); });

const PORT = process.env.PORT || 5002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/workflow';
const NOTIFY_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5003';

// Schemas
const workflowDefinitionSchema = new mongoose.Schema({
	name: { type: String, required: true },
	version: { type: Number, required: true, default: 1 },
	states: { type: [String], default: [] },
	transitions: { type: Object, default: {} } // { state: { event: nextState } }
}, { timestamps: true });
workflowDefinitionSchema.index({ name: 1, version: 1 }, { unique: true });

const workflowInstanceSchema = new mongoose.Schema({
	definitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowDefinition', index: true },
	currentState: String,
	status: { type: String, default: 'running' },
	context: { type: Object, default: {} },
	history: { type: Array, default: [] }
}, { timestamps: true });

const WorkflowDefinition = mongoose.models.WorkflowDefinition || mongoose.model('WorkflowDefinition', workflowDefinitionSchema);
const WorkflowInstance = mongoose.models.WorkflowInstance || mongoose.model('WorkflowInstance', workflowInstanceSchema);

// Masters
const projectMasterSchema = new mongoose.Schema({
	projectNo: { type: String, required: true, unique: true },
	projectName: String,
	client: String,
	address: String,
	phone: String,
	defaultWeather: String
}, { timestamps: true });
const gaugeMasterSchema = new mongoose.Schema({
	name: String,
	make: { type: String, default: 'Troxler' },
	model: { type: String, default: '3430' },
	serialNo: String,
	densityStandardCount: Number,
	moistureStandardCount: Number,
	isDefault: { type: Boolean, default: false }
}, { timestamps: true });
const ProjectMaster = mongoose.models.ProjectMaster || mongoose.model('ProjectMaster', projectMasterSchema);
const GaugeMaster = mongoose.models.GaugeMaster || mongoose.model('GaugeMaster', gaugeMasterSchema);

// FDT Form Schema (Field Density Test form)
const fdtFormSchema = new mongoose.Schema({
	// Header
	client: { type: String, default: '' },
	date: { type: Date, required: true },
	projectNo: { type: String, default: '' },
	projectName: { type: String, default: '' },
	weather: { type: String, default: '' },

	// Testing details
	testedBy: { type: String, default: '' },
	testMode: { type: String, default: 'Direct Transmission' },
	dateTested: { type: Date },
	standardDensityCount: { type: Number },
	standardMoistureCount: { type: Number },
	testMethod: { type: String, default: '' },
	gaugeMake: { type: String, default: 'Troxler' },
	gaugeModel: { type: String, default: '3430' },
	gaugeSN: { type: String, default: '' },
	minCompactionRequirement: { type: Number },
	moistureReqFrom: { type: Number },
	moistureReqTo: { type: Number },

	// Proctor Information rows
	proctors: { type: [{
		proctorId: String,
		materialDescription: String,
		method: String,
		mddPcf: Number,
		omcPct: Number
	}], default: [] },

	// Test Results rows (up to 6 typically)
	testResults: { type: [{
		testNo: Number,
		proctorId: String,
		probeDepthIn: Number,
		wetDensityPcf: Number,
		dryDensityPcf: Number,
		moistureContentPct: Number,
		omcVariation: Number,
		compactionPct: Number,
		compactionSpec: String,
		resultCode: String // A..E
	}], default: [] },

	// Location
	generalLocation: { type: String, default: '' },
	locationTests: { type: [{
		testNo: Number,
		location: String,
		material: String, // 1..6 options or text
		elevLift: String
	}], default: [] },

	// Observation & sign-offs
	observationType: { type: String, enum: ['Full Time', 'Part Time'], default: 'Part Time' },
	fieldRepresentative: { type: String, default: '' },
	reviewedBy: { type: String, default: '' },

	// Raw extras (optional)
	notes: { type: String, default: '' },

	// Publication
	published: { type: Boolean, default: false },
	publishedAt: { type: Date },
	reportUrl: { type: String }
}, { timestamps: true });
const FdtForm = mongoose.models.FdtForm || mongoose.model('FdtForm', fdtFormSchema);

// Concrete Field Form (Single Mix) schema (covers fields from Excel sheet)
const concreteFormSchema = new mongoose.Schema({
	// Reference / Header
	client: String,
	date: { type: Date, required: true },
	projectNo: String,
	projectName: String,
	generalLocation: String,
	specificLocation: String,
	mixId: String,
	cylinderId: String,
	truckNo: String,
	ticketNo: String,
	batchTime: String,
	sampleTime: String,
	timeTruckFinished: String,
	ambientTempF: Number,
	yardsInLoad: Number,
	cumulativeYardsPlaced: Number,
	waterAddedGal: Number,
	waterCementRatio: Number,
	supplier: String,
	plant: String,
	sampledBy: String,
	weather: String,
	estWindMph: Number,
	estRhPct: Number,

	// Physical Properties (measured and spec ranges)
	airContentPct: Number,
	specAirMin: Number,
	specAirMax: Number,
	slumpIn: Number,
	specSlumpMin: Number,
	specSlumpMax: Number,
	tempConcreteF: Number,
	specTempMin: { type: Number, default: 50 },
	specTempMax: { type: Number, default: 90 },
	unitWeightPcf: Number,
	yieldCY: Number,
	relativeYield: Number,
	mixDesignStrengthPsi: Number,
	requiredStrengthPsi: Number,
	cementLb: Number,
	otherCementitiousLb: Number,
	waterLb: Number,
	excessWaterCoarseLb: Number,
	excessWaterFineLb: Number,
	fineAggregateLb: Number,
	coarseAggregate1Lb: Number,
	coarseAggregate2Lb: Number,
	maxAggregateSizeIn: Number,
	admixture1Type: String,
	admixture1Oz: Number,
	admixture2Type: String,
	admixture2Oz: Number,
	admixture3Type: String,
	admixture3Oz: Number,
	totalBatchWeightLb: Number,

	// Equipment Identification
	slumpConeId: String,
	thermometerId: String,
	airMeterId: String,
	unitWeightMeasureId: String,
	scaleId: String,

	// Compressive Strengths (rows A..G)
	strengths: { type: [{
		rowId: String, // A..G
		ageDays: Number,
		testDate: Date,
		diameterIn1: Number,
		diameterIn2: Number,
		lengthIn1: Number,
		lengthIn2: Number,
		lengthIn3: Number,
		massGm: Number,
		capType: String,
		totalLoadLbf: Number,
		areaIn2: Number,
		measuredStrengthPsi: Number,
		specified28DayStrengthPsi: Number,
		typeOfFracture: String,
		personPerformingTest: String,
		measuredDensityPcf: Number
	}], default: [] },

	// Testing equipment (bottom section)
	compMachineId: String,
	caliperId: String,
	compScaleId: String,
	retRings: String,

	// Cylinder logistics
	cylindersCastInField: { type: Boolean, default: false },
	cylindersCastInLab: { type: Boolean, default: false },
	timeCylindersMolded: String,
	cylindersTempRangeFirst24h: String,
	whereCylindersCured: String,
	fieldPlacementObservations: String,
	remarks: String,
	dateCylindersReceivedInLab: Date,
	pickUpBy: String,
	cylindersCondition: { type: String, enum: ['Good', 'Fair', 'Poor', undefined], default: undefined },
	chargeableTime: String,
	testPickUpHours: Number,
	testPickUpMinutes: Number,
	delayedHours: Number,
	delayedMinutes: Number,
	delayedWhy: String,

	// Cylinders cast (counts by size/age, if recorded separately)
	cylinders: { type: [{ qty: Number, sizeIn: Number, ageDays: Number, ids: String }], default: [] },

	// People and notes
	testedBy: String,
	fieldRepresentative: String,
	notes: String,

	// Publication
	published: { type: Boolean, default: false },
	publishedAt: { type: Date },
	reportUrl: String
}, { timestamps: true });
const ConcreteForm = mongoose.models.ConcreteForm || mongoose.model('ConcreteForm', concreteFormSchema);

mongoose.connect(MONGO_URL).then(async ()=>{
	console.log('[workflow-service] connected mongo');
	// Seed minimal dummy data if empty
	const count = await WorkflowDefinition.countDocuments();
	if (count === 0) {
		try {
			const seed = await WorkflowDefinition.create({
				name: 'PermitApproval',
				version: 1,
				states: ['Draft', 'Review', 'Approved'],
				transitions: {
					Draft: { submit: 'Review' },
					Review: { approve: 'Approved', reject: 'Draft' }
				}
			});
			await WorkflowInstance.create({
				definitionId: seed._id,
				currentState: 'Draft',
				context: { project: 'Bridge-001', budget: 1000000 },
				history: [{ state: 'Draft', ts: new Date(), event: 'seed' }]
			});
			console.log('[workflow-service] seeded dummy PermitApproval def + instance');
		} catch (e) {
			console.warn('[workflow-service] seed failed', e?.message || e);
		}
	}
}).catch(e=>console.error('[workflow-service] mongo error', e));

app.get('/health', (_req, res) => res.json({ service: 'workflow-service', status: 'ok' }));

// --- Masters Endpoints ---
// Projects
app.post('/masters/projects', async (req, res) => {
	try { const doc = await ProjectMaster.create(req.body || {}); res.status(201).json(doc); }
	catch(e){ res.status(400).json({ error: e.message }); }
});
app.get('/masters/projects', async (_req, res) => {
	const items = await ProjectMaster.find().sort({ projectNo: 1 }).lean();
	res.json(items);
});
app.get('/masters/projects/:projectNo', async (req, res) => {
	const item = await ProjectMaster.findOne({ projectNo: req.params.projectNo }).lean();
	if (!item) return res.status(404).json({ error: 'not_found' });
	res.json(item);
});
// Gauges
app.post('/masters/gauges', async (req, res) => {
	try {
		if (req.body?.isDefault) await GaugeMaster.updateMany({ isDefault: true }, { isDefault: false });
		const doc = await GaugeMaster.create(req.body || {});
		res.status(201).json(doc);
	} catch(e){ res.status(400).json({ error: e.message }); }
});
app.get('/masters/gauges', async (_req, res) => {
	const items = await GaugeMaster.find().sort({ updatedAt: -1 }).lean();
	res.json(items);
});
app.get('/masters/gauges/default', async (_req, res) => {
	const item = await GaugeMaster.findOne({ isDefault: true }).lean();
	res.json(item || null);
});

// --- FDT Form Endpoints ---
const num = z.union([z.number(), z.string().transform(v => v.trim() === '' ? undefined : Number(v)).pipe(z.number())]).optional();
const dateish = z.union([z.string(), z.date()]);
const fdtSchema = z.object({
	client: z.string().optional(),
	date: dateish,
	projectNo: z.string().optional(),
	projectName: z.string().optional(),
	weather: z.string().optional(),

	testedBy: z.string().optional(),
	testMode: z.string().optional(),
	dateTested: dateish.optional(),
	standardDensityCount: num,
	standardMoistureCount: num,
	testMethod: z.string().optional(),
	gaugeMake: z.string().optional(),
	gaugeModel: z.string().optional(),
	gaugeSN: z.string().optional(),
	minCompactionRequirement: num,
	moistureReqFrom: num,
	moistureReqTo: num,

	proctors: z.array(z.object({
		proctorId: z.string().optional(),
		materialDescription: z.string().optional(),
		method: z.string().optional(),
		mddPcf: num,
		omcPct: num
	})).optional(),

	testResults: z.array(z.object({
		testNo: num,
		proctorId: z.string().optional(),
		probeDepthIn: num,
		wetDensityPcf: num,
		dryDensityPcf: num,
		moistureContentPct: num,
		omcVariation: num,
		compactionPct: num,
		compactionSpec: z.string().optional(),
		resultCode: z.string().optional()
	})).optional(),

	generalLocation: z.string().optional(),
	locationTests: z.array(z.object({
		testNo: num,
		location: z.string().optional(),
		material: z.string().optional(),
		elevLift: z.string().optional()
	})).optional(),

	observationType: z.enum(['Full Time', 'Part Time']).optional(),
	fieldRepresentative: z.string().optional(),
	reviewedBy: z.string().optional(),
	notes: z.string().optional()
});
app.post('/fdt', async (req, res) => {
		try {
			const body = fdtSchema.parse(req.body || {});
			// Prefill from ProjectMaster and GaugeMaster if available
			let prefilled = { ...body };
			if (body.projectNo) {
				const pm = await ProjectMaster.findOne({ projectNo: body.projectNo }).lean();
				if (pm) {
					prefilled.client = prefilled.client || pm.client;
					prefilled.projectName = prefilled.projectName || pm.projectName;
					prefilled.weather = prefilled.weather || pm.defaultWeather;
				}
			}
			if (!body.gaugeMake || !body.gaugeModel) {
				const gm = await GaugeMaster.findOne({ isDefault: true }).lean() || await GaugeMaster.findOne().lean();
				if (gm) {
					prefilled.gaugeMake = prefilled.gaugeMake || gm.make;
					prefilled.gaugeModel = prefilled.gaugeModel || gm.model;
					prefilled.gaugeSN = prefilled.gaugeSN || gm.serialNo;
					prefilled.standardDensityCount = prefilled.standardDensityCount ?? gm.densityStandardCount;
					prefilled.standardMoistureCount = prefilled.standardMoistureCount ?? gm.moistureStandardCount;
				}
			}

			// Compute compaction and result codes when possible
			const proctorById = Object.fromEntries((prefilled.proctors||[]).filter(p=>p?.proctorId).map(p=> [p.proctorId, p]));
			const minus = Number(prefilled.moistureReqFrom ?? 0);
			const plus = Number(prefilled.moistureReqTo ?? 0);
			const minComp = Number(prefilled.minCompactionRequirement ?? 0);
			prefilled.testResults = (prefilled.testResults || []).map(tr => {
				let compactionPct = tr.compactionPct;
				let resultCode = tr.resultCode;
				const p = tr.proctorId ? proctorById[tr.proctorId] : undefined;
				if (!compactionPct && p?.mddPcf && tr?.dryDensityPcf){
					compactionPct = Math.round((Number(tr.dryDensityPcf)/Number(p.mddPcf))*1000)/10; // 0.1%
				}
				if (!resultCode && p?.omcPct != null && tr?.moistureContentPct != null){
					const omc = Number(p.omcPct);
					const mc = Number(tr.moistureContentPct);
					const high = omc + plus;
					const low = omc - minus;
					if (compactionPct != null && Number(compactionPct) < minComp) resultCode = 'B';
					else if (mc > high) resultCode = 'D';
					else if (mc < low) resultCode = 'E';
					else if (compactionPct != null) resultCode = 'A';
				}
				return { ...tr, compactionPct, resultCode };
			});
			const coerceDate = (d) => d ? (typeof d === 'string' ? new Date(d) : d) : undefined;
			const doc = await FdtForm.create({
				...prefilled,
				date: coerceDate(body.date),
				dateTested: coerceDate(body.dateTested)
			});
		res.status(201).json(doc);
	} catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/fdt', async (_req, res) => {
	const items = await FdtForm.find().sort({ createdAt: -1 }).lean();
	res.json(items);
});
app.get('/fdt/:id', async (req, res) => {
	try {
		const item = await FdtForm.findById(req.params.id).lean();
		if (!item) return res.status(404).json({ error: 'not_found' });
		res.json(item);
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// --- Concrete Form Endpoints ---
const cnum = z.union([z.number(), z.string().transform(v => v.trim() === '' ? undefined : Number(v)).pipe(z.number())]).optional();
const cdateish = z.union([z.string(), z.date()]);
const concreteSchema = z.object({
	// Reference / Header
	client: z.string().optional(),
	date: cdateish,
	projectNo: z.string().optional(),
	projectName: z.string().optional(),
	generalLocation: z.string().optional(),
	specificLocation: z.string().optional(),
	mixId: z.string().optional(),
	cylinderId: z.string().optional(),
	truckNo: z.string().optional(),
	ticketNo: z.string().optional(),
	batchTime: z.string().optional(),
	sampleTime: z.string().optional(),
	timeTruckFinished: z.string().optional(),
	ambientTempF: cnum,
	yardsInLoad: cnum,
	cumulativeYardsPlaced: cnum,
	waterAddedGal: cnum,
	waterCementRatio: cnum,
	supplier: z.string().optional(),
	plant: z.string().optional(),
	sampledBy: z.string().optional(),
	weather: z.string().optional(),
	estWindMph: cnum,
	estRhPct: cnum,

	// Physical Properties
	airContentPct: cnum,
	specAirMin: cnum,
	specAirMax: cnum,
	slumpIn: cnum,
	specSlumpMin: cnum,
	specSlumpMax: cnum,
	tempConcreteF: cnum,
	specTempMin: cnum,
	specTempMax: cnum,
	unitWeightPcf: cnum,
	yieldCY: cnum,
	relativeYield: cnum,
	mixDesignStrengthPsi: cnum,
	requiredStrengthPsi: cnum,
	cementLb: cnum,
	otherCementitiousLb: cnum,
	waterLb: cnum,
	excessWaterCoarseLb: cnum,
	excessWaterFineLb: cnum,
	fineAggregateLb: cnum,
	coarseAggregate1Lb: cnum,
	coarseAggregate2Lb: cnum,
	maxAggregateSizeIn: cnum,
	admixture1Type: z.string().optional(),
	admixture1Oz: cnum,
	admixture2Type: z.string().optional(),
	admixture2Oz: cnum,
	admixture3Type: z.string().optional(),
	admixture3Oz: cnum,
	totalBatchWeightLb: cnum,

	// Equipment
	slumpConeId: z.string().optional(),
	thermometerId: z.string().optional(),
	airMeterId: z.string().optional(),
	unitWeightMeasureId: z.string().optional(),
	scaleId: z.string().optional(),

	// Compressive strengths rows
	strengths: z.array(z.object({
		rowId: z.string().optional(),
		ageDays: cnum,
		testDate: cdateish.optional(),
		diameterIn1: cnum,
		diameterIn2: cnum,
		lengthIn1: cnum,
		lengthIn2: cnum,
		lengthIn3: cnum,
		massGm: cnum,
		capType: z.string().optional(),
		totalLoadLbf: cnum,
		areaIn2: cnum,
		measuredStrengthPsi: cnum,
		specified28DayStrengthPsi: cnum,
		typeOfFracture: z.string().optional(),
		personPerformingTest: z.string().optional(),
		measuredDensityPcf: cnum
	})).optional(),

	// Testing equipment bottom
	compMachineId: z.string().optional(),
	caliperId: z.string().optional(),
	compScaleId: z.string().optional(),
	retRings: z.string().optional(),

	// Cylinder logistics
	cylindersCastInField: z.boolean().optional(),
	cylindersCastInLab: z.boolean().optional(),
	timeCylindersMolded: z.string().optional(),
	cylindersTempRangeFirst24h: z.string().optional(),
	whereCylindersCured: z.string().optional(),
	fieldPlacementObservations: z.string().optional(),
	remarks: z.string().optional(),
	dateCylindersReceivedInLab: cdateish.optional(),
	pickUpBy: z.string().optional(),
	cylindersCondition: z.enum(['Good','Fair','Poor']).optional(),
	chargeableTime: z.string().optional(),
	testPickUpHours: cnum,
	testPickUpMinutes: cnum,
	delayedHours: cnum,
	delayedMinutes: cnum,
	delayedWhy: z.string().optional(),

	// Cylinders cast summary rows
	cylinders: z.array(z.object({ qty: cnum, sizeIn: cnum, ageDays: cnum, ids: z.string().optional() })).optional(),

	// People / notes
	testedBy: z.string().optional(),
	fieldRepresentative: z.string().optional(),
	notes: z.string().optional()
});
app.post('/concrete', async (req, res) => {
	try {
		const body = concreteSchema.parse(req.body || {});
		const coerceDate = (d) => d ? (typeof d === 'string' ? new Date(d) : d) : undefined;
		const doc = await ConcreteForm.create({ ...body, date: coerceDate(body.date) });
		res.status(201).json(doc);
	} catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/concrete', async (_req, res) => {
	const items = await ConcreteForm.find().sort({ createdAt: -1 }).lean();
	res.json(items);
});
app.get('/concrete/:id', async (req, res) => {
	try {
		const item = await ConcreteForm.findById(req.params.id).lean();
		if (!item) return res.status(404).json({ error: 'not_found' });
		res.json(item);
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// Create definition
const defSchema = z.object({
	name: z.string(),
	version: z.number().optional(),
	states: z.array(z.string()).min(1),
	transitions: z.record(z.string(), z.record(z.string(), z.string())).optional()
});
app.post('/workflows', async (req, res) => {
	try {
		const parsed = defSchema.parse(req.body || {});
	const def = await withSpan('create_definition', () => WorkflowDefinition.create(parsed), req.logger);
		res.status(201).json(def);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});

app.get('/workflows', async (_req, res) => {
	const defs = await WorkflowDefinition.find().lean();
	res.json(defs);
});

// Get one definition
app.get('/workflows/:id', async (req, res) => {
	try {
		const def = await WorkflowDefinition.findById(req.params.id).lean();
		if (!def) return res.status(404).json({ error: 'definition_not_found' });
		res.json(def);
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// Update definition
const defUpdateSchema = z.object({
	name: z.string().optional(),
	version: z.number().optional(),
	states: z.array(z.string()).min(1).optional(),
	transitions: z.record(z.string(), z.record(z.string(), z.string())).optional()
});
app.put('/workflows/:id', async (req, res) => {
	try {
		const update = defUpdateSchema.parse(req.body || {});
		const def = await WorkflowDefinition.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
		if (!def) return res.status(404).json({ error: 'definition_not_found' });
		res.json(def);
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete definition (blocked if instances exist)
app.delete('/workflows/:id', async (req, res) => {
	try {
		const count = await WorkflowInstance.countDocuments({ definitionId: req.params.id });
		if (count > 0) return res.status(409).json({ error: 'definition_in_use', instances: count });
		const r = await WorkflowDefinition.findByIdAndDelete(req.params.id);
		if (!r) return res.status(404).json({ error: 'definition_not_found' });
		res.json({ ok: true });
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// Start instance
const startSchema = z.object({ definitionId: z.string(), context: z.record(z.any()).optional() });
app.post('/workflow-instances', async (req, res) => {
	try {
		const { definitionId, context } = startSchema.parse(req.body || {});
		const def = await WorkflowDefinition.findById(definitionId);
		if (!def) return res.status(404).json({ error: 'definition_not_found' });
		const initialState = def.states[0];

		// Prefill context from masters
		let enriched = { ...(context || {}) };
		try {
			if (enriched.projectNo) {
				const pm = await ProjectMaster.findOne({ projectNo: enriched.projectNo }).lean();
				if (pm) {
					enriched.client = enriched.client || pm.client;
					enriched.projectName = enriched.projectName || pm.projectName;
					enriched.weather = enriched.weather || pm.defaultWeather;
				}
			}
			const gm = await GaugeMaster.findOne({ isDefault: true }).lean();
			if (gm) {
				enriched.gaugeMake = enriched.gaugeMake || gm.make;
				enriched.gaugeModel = enriched.gaugeModel || gm.model;
				enriched.gaugeSN = enriched.gaugeSN || gm.serialNo;
			}
		} catch (e) { req.logger?.warn?.('prefill_context_failed', { error: e?.message }); }

	const inst = await withSpan('create_instance', () => WorkflowInstance.create({ definitionId, currentState: initialState, context: enriched, history: [{ state: initialState, ts: new Date() }] }), req.logger);
		res.status(201).json(inst);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});

app.get('/workflow-instances/:id', async (req, res) => {
	const inst = await WorkflowInstance.findById(req.params.id).lean();
	if (!inst) return res.status(404).json({ error: 'instance_not_found' });
	res.json(inst);
});

// List instances (optional pagination)
app.get('/workflow-instances', async (req, res) => {
	const { limit = 25, skip = 0 } = req.query;
	const l = Math.min(parseInt(limit, 10) || 25, 100);
	const s = Math.max(parseInt(skip, 10) || 0, 0);
	const items = await WorkflowInstance.find().sort({ createdAt: -1 }).skip(s).limit(l).lean();
	res.json(items);
});

// Send event
const eventSchema = z.object({ event: z.string() });
app.post('/workflow-instances/:id/events', async (req, res) => {
	try {
		const { event } = eventSchema.parse(req.body || {});
		const inst = await WorkflowInstance.findById(req.params.id);
		if (!inst) return res.status(404).json({ error: 'instance_not_found' });
		const def = await WorkflowDefinition.findById(inst.definitionId);
		const map = def.transitions?.[inst.currentState] || {};
		const next = map[event];
		if (!next) return res.status(400).json({ error: 'invalid_event' });
		inst.history.push({ state: next, ts: new Date(), event });
		inst.currentState = next;
		if (next.toLowerCase() === 'end' || next.toLowerCase() === 'completed') inst.status = 'completed';

		// Auto-generate report hook on approve/publish
		if ((event === 'approve' || event === 'publish_report') && inst?.context?.fdtId) {
			try {
				const id = inst.context.fdtId;
				await FdtForm.findByIdAndUpdate(id, { published: true, publishedAt: new Date(), reportUrl: `/fdt/${id}` });
				// notify
				try {
					await fetch(`${NOTIFY_URL}/notify/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'fdt_published', id, instanceId: inst._id, url: `/fdt/${id}` }) });
				} catch (e) { req.logger?.warn?.('notify_failed', { error: e?.message }); }
				req.logger?.info?.('auto_publish_report', { fdtId: id });
			} catch (e) { req.logger?.warn?.('auto_publish_failed', { error: e?.message }); }
		}
		await inst.save();
		res.json(inst);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});

// Update instance (context/status/state)
const instUpdateSchema = z.object({
	context: z.record(z.any()).optional(),
	status: z.string().optional(),
	currentState: z.string().optional()
});
app.patch('/workflow-instances/:id', async (req, res) => {
	try {
		const update = instUpdateSchema.parse(req.body || {});
		const inst = await WorkflowInstance.findByIdAndUpdate(req.params.id, update, { new: true });
		if (!inst) return res.status(404).json({ error: 'instance_not_found' });
		res.json(inst);
	} catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete instance
app.delete('/workflow-instances/:id', async (req, res) => {
	try {
		const r = await WorkflowInstance.findByIdAndDelete(req.params.id);
		if (!r) return res.status(404).json({ error: 'instance_not_found' });
		res.json({ ok: true });
	} catch (e) { res.status(400).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`[workflow-service] listening on ${PORT}`));
