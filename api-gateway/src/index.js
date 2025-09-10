// OTEL bootstrap (no-op if exporter not reachable)
import './otel-bootstrap.js';
import express from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { ensureCorrelationId, createLogger, withSpan } from '../shared-lib/dist/index.js';

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  const cid = ensureCorrelationId(req.headers['x-request-id']);
  req.correlationId = cid;
  next();
});

// Load OpenAPI spec
const openapiPath = path.join(process.cwd(), 'openapi.yaml');
let openapiDoc = null;
try {
  openapiDoc = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
  console.log('[api-gateway] OpenAPI spec loaded');
} catch (e) {
  console.warn('[api-gateway] OpenAPI spec missing', e.message);
}
if (openapiDoc) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
}

const PORT = process.env.PORT || 4000;
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  workflow: process.env.WORKFLOW_SERVICE_URL || 'http://localhost:5002',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003'
};
app.use((req, res, next) => {
  res.setHeader('x-request-id', req.correlationId);
  req.logger = createLogger('api-gateway', req.correlationId);
  req.logger.info('request', { method: req.method, url: req.url });
  next();
});

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', services });
});

app.get('/aggregate/health', async (req, res) => {
  const data = await withSpan('aggregate_health', async () => {
    const entries = await Promise.all(Object.entries(services).map(async ([key, base]) => {
      try {
        const r = await fetch(`${base}/health`, { timeout: 3000, headers: { 'x-request-id': req.correlationId } }).then(r => r.json());
        return [key, r];
      } catch (e) {
        return [key, { error: e.message }];
      }
    }));
    return Object.fromEntries(entries);
  }, req.logger);
  res.json(data);
});

// Auth verification proxy route
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

app.get('/secure/ping', verifyToken, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.get('/secure/me', verifyToken, async (req, res) => {
  try {
  const r = await fetch(`${services.auth}/auth/me`, { headers: { Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`, 'x-request-id': req.correlationId } });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin only route
app.get('/secure/admin', verifyToken, (req, res) => {
  if (!req.user?.roles?.includes('admin')) return res.status(403).json({ error: 'forbidden' });
  res.json({ ok: true, admin: true });
});

// Simple in-memory rate limiter (IP-based)
const buckets = new Map();
const LIMIT = 100; // requests
const WINDOW_MS = 60_000; // 1 minute
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now - bucket.start >= WINDOW_MS) {
    bucket = { start: now, count: 0 };
    buckets.set(ip, bucket);
  }
  bucket.count++;
  if (bucket.count > LIMIT) return res.status(429).json({ error: 'rate_limited' });
  next();
});

app.listen(PORT, () => console.log(`[api-gateway] listening on ${PORT}`));
