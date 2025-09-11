import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ensureCorrelationId, createLogger, withSpan } from '../shared-lib/dist/index.js';

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
	notes: { type: String, default: '' }
}, { timestamps: true });
const FdtForm = mongoose.models.FdtForm || mongoose.model('FdtForm', fdtFormSchema);

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
			const coerceDate = (d) => d ? (typeof d === 'string' ? new Date(d) : d) : undefined;
			const doc = await FdtForm.create({
				...body,
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
	const inst = await withSpan('create_instance', () => WorkflowInstance.create({ definitionId, currentState: initialState, context: context || {}, history: [{ state: initialState, ts: new Date() }] }), req.logger);
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
