"use client";
import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { baseUrls, jsonFetch } from '../../lib/api';

export default function DefinitionsPage() {
  const { workflow } = baseUrls();
  const [defs, setDefs] = useState([]);
  const [name, setName] = useState('PermitApproval');
  const [states, setStates] = useState('Draft,Review,Approved');
  // Structured transition rules instead of raw JSON
  const [rules, setRules] = useState([{ from: '', event: '', to: '' }]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const d = await fetch(`${workflow}/workflows`, { cache: 'no-store' }).then(r=>r.json());
      setDefs(Array.isArray(d) ? d : []);
    } catch (e) { setErr(String(e.message||e)); }
  };
  useEffect(()=>{ load(); },[]);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const st = states.split(',').map(s=>s.trim()).filter(Boolean);
      // Build transitions map: { [from]: { [event]: to } }
      const tr = rules.reduce((acc, r) => {
        if (!r.from || !r.event || !r.to) return acc;
        acc[r.from] = acc[r.from] || {};
        acc[r.from][r.event] = r.to;
        return acc;
      }, {});
      await jsonFetch(`${workflow}/workflows`, { method:'POST', body: JSON.stringify({ name, states: st, transitions: tr }) });
      await load();
    } catch (e) { setErr(String(e.message||e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Card title="New Workflow Definition" action={
        <button className="btn" disabled={loading} onClick={create}>Create</button>
      }>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={create}>
          <label className="label">Name
            <input className="input w-full mt-1" value={name} onChange={e=>setName(e.target.value)} />
          </label>
          <label className="label">States (comma-separated)
            <input className="input w-full mt-1" value={states} onChange={e=>setStates(e.target.value)} />
          </label>
          <div className="md:col-span-2">
            <div className="label mb-2">Transitions</div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left">From state</th>
                    <th className="text-left">Event</th>
                    <th className="text-left">To state</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => {
                    const stateList = states.split(',').map(s=>s.trim()).filter(Boolean);
                    return (
                      <tr key={i}>
                        <td>
                          <select className="input w-full" value={r.from} onChange={e=>{
                            const v = e.target.value; setRules(prev=>prev.map((x,idx)=>idx===i?{...x, from:v}:x));
                          }}>
                            <option value="">Select…</option>
                            {stateList.map(s=> <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <input className="input w-full" placeholder="e.g. submit" value={r.event} onChange={e=>{
                            const v = e.target.value; setRules(prev=>prev.map((x,idx)=>idx===i?{...x, event:v}:x));
                          }} />
                        </td>
                        <td>
                          <select className="input w-full" value={r.to} onChange={e=>{
                            const v = e.target.value; setRules(prev=>prev.map((x,idx)=>idx===i?{...x, to:v}:x));
                          }}>
                            <option value="">Select…</option>
                            {stateList.map(s=> <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="text-right">
                          <button type="button" className="btn" onClick={()=> setRules(prev=> prev.length>1 ? prev.filter((_,idx)=>idx!==i) : prev)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2">
              <button type="button" className="btn" onClick={()=> setRules(prev=> [...prev, { from:'', event:'', to:'' }])}>+ Add rule</button>
            </div>
          </div>
        </form>
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>

      <Card title="Definitions">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>States</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {defs.map(d => (
              <tr key={d._id}>
                <td className="font-medium">{d.name}</td>
                <td>v{d.version}</td>
                <td className="text-zinc-700">{(d.states||[]).join(', ')}</td>
                <td className="text-right">
                  <a className="btn" href={`/instances/new?definitionId=${d._id}`}>Start Instance</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
