"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '../../../components/Card';
import { baseUrls, jsonFetch } from '../../../lib/api';

export const dynamic = 'force-dynamic';

function NewInstanceInner() {
  const sp = useSearchParams();
  const definitionId = sp.get('definitionId') || '';
  const { workflow } = baseUrls();
  const [context, setContext] = useState('{"project":"Bridge-001","budget":1000000}');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const start = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const ctx = JSON.parse(context||'{}');
      const d = await jsonFetch(`${workflow}/workflow-instances`, { method:'POST', body: JSON.stringify({ definitionId, context: ctx }) });
      setResult(d);
    } catch (e) { setErr(String(e.message||e)); }
  };

  return (
    <div className="space-y-6">
      <Card title="Start Instance" action={<button className="btn" onClick={start}>Start</button>}>
        <form className="grid gap-4" onSubmit={start}>
          <label className="label">Definition ID
            <input className="input mt-1 w-full" value={definitionId} readOnly />
          </label>
          <label className="label">Context JSON
            <textarea className="input w-full h-40 mt-1" value={context} onChange={e=>setContext(e.target.value)} />
          </label>
        </form>
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>

      {result && (
        <Card title="Created Instance">
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          <a className="btn mt-3 inline-block" href={`/instances/${result._id}`}>Open Instance</a>
        </Card>
      )}
    </div>
  );
}

export default function NewInstancePage() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="card p-4">Loading…</div></div>}>
      <NewInstanceInner />
    </Suspense>
  );
}
