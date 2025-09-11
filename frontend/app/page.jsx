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
    <main className="space-y-6">
      <section className="card p-4">
        <h1 className="text-2xl font-semibold mb-2">Civil Engineering Workflow</h1>
  <p className="text-zinc-700">Public Gateway URL: {publicGateway}</p>
  <p className="text-zinc-500 text-sm">Internal fetch base: {internalGateway}</p>
        <div className="mt-4 flex gap-3">
          <a className="btn" href="/definitions">Definitions</a>
          <a className="btn" href="/instances">Instances</a>
        </div>
      </section>
      <section className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Gateway Health</h2>
  <pre className="codeblock">{JSON.stringify(health, null, 2)}</pre>
      </section>
    </main>
  );
}
