"use client";
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const wfBase = gateway.replace(':4000', ':5002');
  const [defs, setDefs] = useState([]);
  const [name, setName] = useState('SampleFlow');
  const [message, setMessage] = useState('');

  async function loadDefs() {
    try { const r = await fetch(`${wfBase}/workflows`); const d = await r.json(); setDefs(d); } catch (e) { setMessage(e.message); }
  }
  useEffect(()=>{ loadDefs(); },[]);

  async function createDef(e) {
    e.preventDefault();
    setMessage('');
    try {
      const r = await fetch(`${wfBase}/workflows`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, states:['start','end'], transitions:{ start:{ finish:'end'} } }) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error || 'error'); return; }
      setMessage('Created');
      loadDefs();
    } catch (e) { setMessage(e.message); }
  }

  return <main className="space-y-6">
    <section className="card p-4">
      <h1 className="text-xl font-semibold mb-3">Workflow Dashboard (legacy)</h1>
  <p className="text-zinc-700 mb-3">Prefer the modern <a className="text-blue-700 underline" href="/definitions">Definitions</a> page.</p>
      <form onSubmit={createDef} className="flex gap-2">
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn">Create</button>
      </form>
  {message && <p className="mt-2 text-zinc-700">{message}</p>}
    </section>
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2">Definitions</h2>
      <ul className="space-y-1">
        {defs.map(d => <li key={d._id || d.id}>{d.name} v{d.version}</li>)}
      </ul>
    </section>
  </main>;
}
