export function baseUrls() {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const auth = process.env.NEXT_PUBLIC_AUTH_URL || gateway.replace(':4000', ':5001');
  const workflow = process.env.NEXT_PUBLIC_WORKFLOW_URL || gateway.replace(':4000', ':5002');
  return { gateway, auth, workflow };
}

export async function jsonFetch(url, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}

export async function authJsonFetch(url, opts = {}) {
  const t = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(url, { ...opts, headers, cache: 'no-store' });
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}
