export const dynamic = 'force-dynamic';
const base = process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

export async function GET(_req, { params }) {
  const r = await fetch(`${base}/workflow-instances/${params.id}`, { cache: 'no-store' });
  const data = await r.json();
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH(req, { params }) {
  const body = await req.text();
  const r = await fetch(`${base}/workflow-instances/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
  const data = await r.json();
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(_req, { params }) {
  const r = await fetch(`${base}/workflow-instances/${params.id}`, { method: 'DELETE' });
  const data = await r.json().catch(()=>({ ok: r.ok }));
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}
