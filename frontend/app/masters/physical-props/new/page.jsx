"use client";
import Card from '../../../../components/Card';
import { baseUrls, jsonFetch } from '../../../../lib/api';
import { useState } from 'react';

export default function NewPhysicalProps() {
  const { workflow } = baseUrls();
  const [data, setData] = useState({ name: '', values: { airContentPct: '', slumpIn: '', unitWeightPcf: '', specAirMin: '', specAirMax: '', specSlumpMin: '', specSlumpMax: '', specTempMin: '', specTempMax: '' } });
  const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const submit = async()=>{
    try { setErr(''); const r = await jsonFetch(`${workflow}/masters/physical-props`, { method:'POST', body: JSON.stringify({ ...data, values: Object.fromEntries(Object.entries(data.values).map(([k,v])=>[k, v===''? undefined : Number(v)])) }) }); setRes(r); } catch(e){ setErr(String(e.message||e)); }
  };
  const fields = Object.keys(data.values);
  return (
    <div className="space-y-4">
      <Card title="Create Physical Properties" action={<button className="btn" onClick={submit}>Save</button>}>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="label">name
            <input className="input mt-1 w-full" value={data.name} onChange={e=> setData(d=> ({...d, name: e.target.value}))} />
          </label>
          {fields.map(k=> (
            <label className="label" key={k}>{k}
              <input className="input mt-1 w-full" value={data.values[k]} onChange={e=> setData(d=> ({...d, values: { ...d.values, [k]: e.target.value }}))} />
            </label>
          ))}
        </div>
        {err && <p className="text-red-500 mt-2">{err}</p>}
        {res && <p className="text-emerald-600 mt-2">Created {res.name}</p>}
      </Card>
    </div>
  );
}
