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

  return <main style={{ fontFamily:'system-ui', padding:'2rem' }}>
    <h1>Workflow Dashboard</h1>
    <form onSubmit={createDef} style={{ display:'flex', gap:'0.5rem' }}>
      <input value={name} onChange={e=>setName(e.target.value)} />
      <button>Create</button>
    </form>
    {message && <p>{message}</p>}
    <h2>Definitions</h2>
    <ul>
      {defs.map(d => <li key={d._id || d.id}>{d.name} v{d.version}</li>)}
    </ul>
  </main>;
}
