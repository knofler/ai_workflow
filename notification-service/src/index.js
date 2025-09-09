import express from 'express';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ensureCorrelationId, createLogger } from '../shared-lib/dist/index.js';

const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.correlationId = ensureCorrelationId(req.headers['x-request-id']); next(); });
app.use((req, _res, next) => { req.logger = createLogger('notification-service', req.correlationId); req.logger.info('request', { method: req.method, url: req.url }); next(); });
const PORT = process.env.PORT || 5003;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// BullMQ v5: no QueueScheduler needed; ensure ioredis option maxRetriesPerRequest = null per BullMQ requirement
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const notifyQueue = new Queue('notifications', { connection });
new Worker('notifications', async job => {
	console.log(JSON.stringify({ level: 'info', service: 'notification-service', msg: 'job_start', id: job.id }));
	return { delivered: true };
}, { connection });

app.get('/health', async (_req, res) => {
	res.json({ service: 'notification-service', status: 'ok' });
});

app.post('/notify/test', async (req, res) => {
	const job = await notifyQueue.add('test', { at: new Date().toISOString(), payload: req.body || {} });
	res.status(202).json({ queued: true, id: job.id });
});

app.listen(PORT, () => console.log(`[notification-service] listening on ${PORT}`));
