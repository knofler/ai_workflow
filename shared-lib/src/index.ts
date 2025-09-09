export const sharedVersion = "0.2.0";

export interface JwtClaims {
  sub: string;
  username: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

export interface StandardResponse<T=unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function healthInfo(service: string) {
  return { service, sharedVersion, timestamp: new Date().toISOString() };
}

export const Roles = {
  Admin: 'admin',
  User: 'user'
} as const;

export type Role = typeof Roles[keyof typeof Roles];

// Correlation / logging helpers
export function ensureCorrelationId(existing?: string) {
  return existing && existing.length <= 100 ? existing : `req_${Math.random().toString(36).slice(2)}${Date.now()}`;
}

export interface LogFields { [k: string]: unknown }

export function createLogger(service: string, correlationId?: string) {
  function base(level: string, msg: string, fields?: LogFields) {
    const rec: any = { ts: new Date().toISOString(), level, service, msg };
    if (correlationId) rec.correlationId = correlationId;
    if (fields) Object.assign(rec, fields);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(rec));
  }
  return {
    info: (m: string, f?: LogFields) => base('info', m, f),
    error: (m: string, f?: LogFields) => base('error', m, f),
    debug: (m: string, f?: LogFields) => base('debug', m, f)
  };
}

// (Lightweight) tracing span helper stub (real OTEL setup in services)
export async function withSpan(name: string, fn: () => Promise<any> | any, logger?: ReturnType<typeof createLogger>) {
  const start = Date.now();
  try {
    const result = await fn();
    logger?.debug?.('span_complete', { span: name, ms: Date.now() - start });
    return result;
  } catch (e: any) {
    logger?.error?.('span_error', { span: name, ms: Date.now() - start, error: e.message });
    throw e;
  }
}


