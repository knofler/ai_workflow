import './otel-bootstrap.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ensureCorrelationId, createLogger, withSpan } from '../shared-lib/dist/index.js';
import { v4 as uuid } from 'uuid';

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
app.use((req, _res, next) => { req.logger = createLogger('auth-service', req.correlationId); req.logger.info('request', { method: req.method, url: req.url }); next(); });

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/workflow';

// User model
const refreshTokenSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  expiresAt: { type: Date, index: true },
  revoked: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, index: true },
  passwordHash: String,
  roles: { type: [String], default: [] }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);
const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', refreshTokenSchema);

mongoose.connect(MONGO_URL).then(() => {
  console.log('[auth-service] connected mongo');
  seedAdmin();
}).catch(e => console.error('[auth-service] mongo error', e));

async function seedAdmin() {
  const count = await User.countDocuments();
  if (count === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', passwordHash, roles: ['admin'] });
    console.log('[auth-service] seeded default admin credentials admin/admin123');
  }
}

app.get('/health', (_req, res) => res.json({ service: 'auth-service', status: 'ok' }));

const registerSchema = z.object({ username: z.string().min(3), password: z.string().min(6) });
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = registerSchema.parse(req.body || {});
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash, roles: [] });
    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

const loginSchema = z.object({ username: z.string(), password: z.string() });
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body || {});
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const accessToken = jwt.sign({ sub: user._id.toString(), username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: '15m' });
  const { refreshToken, tokenId } = await issueRefreshToken(user._id);
  return res.json({ accessToken, refreshToken, tokenId });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: 'not_found' });
  res.json({ username: user.username, roles: user.roles, id: user._id });
});

app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'missing_refresh' });
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const record = await RefreshToken.findOne({ tokenId: payload.tid, userId: payload.sub });
    if (!record || record.revoked || record.expiresAt < new Date()) return res.status(401).json({ error: 'invalid_refresh' });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'invalid_refresh' });
    const accessToken = jwt.sign({ sub: user._id.toString(), username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: 'invalid_refresh' });
  }
});

app.post('/auth/logout', authMiddleware, async (req, res) => {
  const { tokenId } = req.body || {};
  if (tokenId) await RefreshToken.updateOne({ tokenId, userId: req.user.sub }, { $set: { revoked: true } });
  res.json({ ok: true });
});

app.post('/auth/roles/grant', authMiddleware, requireRole('admin'), async (req, res) => {
  const { username, role } = req.body || {};
  if (!username || !role) return res.status(400).json({ error: 'missing_fields' });
  const user = await User.findOneAndUpdate({ username }, { $addToSet: { roles: role } }, { new: true });
  if (!user) return res.status(404).json({ error: 'user_not_found' });
  res.json({ ok: true, roles: user.roles });
});

function authMiddleware(req, res, next) {
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

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

async function issueRefreshToken(userId) {
  const tokenId = uuid();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7d
  await RefreshToken.create({ tokenId, userId, expiresAt });
  const refreshToken = jwt.sign({ sub: userId.toString(), tid: tokenId }, JWT_SECRET, { expiresIn: '7d' });
  return { refreshToken, tokenId };
}

app.listen(PORT, () => console.log(`[auth-service] listening on ${PORT}`));
