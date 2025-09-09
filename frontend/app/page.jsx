export const dynamic = 'force-dynamic';

export default async function Home() {
  const publicGateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const internalGateway = process.env.GATEWAY_INTERNAL_URL || publicGateway;
  let health;
  try {
    const res = await fetch(`${internalGateway}/health`, { cache: 'no-store' });
    health = await res.json();
  } catch (e) {
    health = { error: e.message, tried: `${internalGateway}/health` };
  }
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Workflow Platform UI</h1>
      <p>Public Gateway URL: {publicGateway}</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Internal fetch base: {internalGateway}</p>
      <h2>Gateway Health</h2>
      <pre style={{ background: '#111', color: '#0f0', padding: '1rem', overflowX: 'auto' }}>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}
