import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ensureCorrelationId, createLogger, withSpan } from '../shared-lib/dist/index.js';

const app = express();
app.use(express.json());
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

mongoose.connect(MONGO_URL).then(()=>console.log('[workflow-service] connected mongo')).catch(e=>console.error('[workflow-service] mongo error', e));

app.get('/health', (_req, res) => res.json({ service: 'workflow-service', status: 'ok' }));

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

app.listen(PORT, () => console.log(`[workflow-service] listening on ${PORT}`));
