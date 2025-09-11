"use client";
export default function StepCylinders({ data, setData }) {
  const addCyl = () => setData(d=> ({...d, cylinders: [...(d.cylinders||[]), { id:"", diameterIn:"", heightIn:"", massLb:"", notes:"" }]}));
  const removeCyl = (idx) => setData(d=> ({...d, cylinders: (d.cylinders||[]).filter((_,i)=> i!==idx)}));
  const updateCyl = (idx, key, val) => setData(d=> ({...d, cylinders: (d.cylinders||[]).map((c,i)=> i===idx? {...c, [key]: val}: c)}));
  const genId = () => `CYL-${new Date().toISOString().slice(2,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

  const rows = data.cylinders || [];

  return (
    <div className="space-y-3">
      {(rows.length? rows: [{ id:"", diameterIn:"", heightIn:"", massLb:"", notes:"" }]).map((c, idx)=> (
        <div key={idx} className="rounded-lg border p-4 shadow-sm grid md:grid-cols-5 gap-3">
          <label className="label">ID
            <div className="flex gap-2 mt-1">
              <input className="input w-full" value={c.id} onChange={e=> updateCyl(idx, 'id', e.target.value)} />
              <button type="button" className="btn btn-outline" onClick={()=> updateCyl(idx, 'id', data.cylinderId || genId())}>Auto</button>
            </div>
          </label>
          <label className="label">Diameter (in)
            <input className="input mt-1 w-full" placeholder="4" value={c.diameterIn} onChange={e=> updateCyl(idx, 'diameterIn', e.target.value)} />
          </label>
          <label className="label">Height (in)
            <input className="input mt-1 w-full" placeholder="8" value={c.heightIn} onChange={e=> updateCyl(idx, 'heightIn', e.target.value)} />
          </label>
          <label className="label">Mass (lb)
            <input className="input mt-1 w-full" placeholder="e.g., 10.2" value={c.massLb} onChange={e=> updateCyl(idx, 'massLb', e.target.value)} />
          </label>
          <div className="flex items-end gap-2">
            <label className="label w-full">Notes
              <input className="input mt-1 w-full" value={c.notes} onChange={e=> updateCyl(idx, 'notes', e.target.value)} />
            </label>
            <button type="button" className="btn btn-ghost text-red-600" onClick={()=> removeCyl(idx)}>−</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addCyl}>+ Add Cylinder</button>
    </div>
  );
}
