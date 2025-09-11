export const dynamic = 'force-dynamic';
const base = process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

export async function POST(req, { params }) {
  const body = await req.text();
  const r = await fetch(`${base}/workflow-instances/${params.id}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data = await r.json();
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}
