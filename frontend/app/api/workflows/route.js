export const dynamic = 'force-dynamic';

const base = process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

export async function GET() {
  const r = await fetch(`${base}/workflows`, { cache: 'no-store' });
  const data = await r.json();
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req) {
  const body = await req.text();
  const r = await fetch(`${base}/workflows`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data = await r.json();
  return new Response(JSON.stringify(data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}
