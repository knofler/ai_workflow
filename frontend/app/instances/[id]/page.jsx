"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '../../../components/Card';
import { baseUrls, jsonFetch } from '../../../lib/api';

export default function InstanceDetail() {
  const { id } = useParams();
  const { workflow } = baseUrls();
  const [inst, setInst] = useState(null);
  const [event, setEvent] = useState('finish');
  const [err, setErr] = useState('');

  const load = async () => {
    try { const d = await fetch(`${workflow}/workflow-instances/${id}`, { cache: 'no-store' }).then(r=>r.json()); setInst(d); }
    catch (e) { setErr(String(e.message||e)); }
  };
  useEffect(()=>{ load(); },[id]);

  const send = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await jsonFetch(`${workflow}/workflow-instances/${id}/events`, { method:'POST', body: JSON.stringify({ event }) });
      await load();
    } catch (e) { setErr(String(e.message||e)); }
  };

  return (
    <div className="space-y-6">
      <Card title={`Instance ${id}`} action={<button className="btn" onClick={send}>Send Event</button>}>
        <form className="mb-4" onSubmit={send}>
          <label className="label">Event
            <input className="input mt-1" value={event} onChange={e=>setEvent(e.target.value)} />
          </label>
        </form>
        {inst ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">State</h3>
              <p>Current: <span className="text-blue-700 font-medium">{inst.currentState}</span></p>
              <p>Status: {inst.status}</p>
              <h3 className="font-semibold mt-4 mb-2">History</h3>
              <ul className="list-disc pl-6 text-zinc-700">
                {(inst.history||[]).map((h,i)=>(<li key={i}>{h.state} — {new Date(h.ts).toLocaleString()} {h.event ? `(${h.event})`: ''}</li>))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Context</h3>
              <pre className="codeblock">{JSON.stringify(inst.context, null, 2)}</pre>
            </div>
          </div>
  ) : <p className="text-zinc-600">Loading...</p>}
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>
    </div>
  );
}
