"use client";
import Card from '../../../components/Card';
import { baseUrls, jsonFetch } from '../../../lib/api';
import { useState } from 'react';

export default function NewProject() {
  const { workflow } = baseUrls();
  const [data, setData] = useState({ projectNo: '', projectName: '', client: '', address: '', phone: '', defaultWeather: '' });
  const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const submit = async()=>{
    try { setErr(''); const r = await jsonFetch(`${workflow}/masters/projects`, { method:'POST', body: JSON.stringify(data) }); setRes(r); } catch(e){ setErr(String(e.message||e)); }
  };
  return (
    <div className="space-y-4">
      <Card title="Create Project" action={<button className="btn" onClick={submit}>Save</button>}>
        <div className="grid md:grid-cols-2 gap-4">
          {['projectNo','projectName','client','address','phone','defaultWeather'].map(k=> (
            <label className="label" key={k}>{k}
              <input className="input mt-1 w-full" value={data[k]||''} onChange={e=> setData(d=> ({...d,[k]:e.target.value}))} />
            </label>
          ))}
        </div>
        {err && <p className="text-red-500 mt-2">{err}</p>}
        {res && <p className="text-emerald-600 mt-2">Created {res.projectNo}</p>}
      </Card>
    </div>
  );
}
