"use client";
export default function StepStrengths({ data, setData }) {
  const addRow = () => setData(d=> ({...d, strengths: [...(d.strengths||[]), { id:"", lengthIn: "", breakLoad: "", ageDays: "", psi: "" }]}));
  const removeRow = (idx) => setData(d=> ({...d, strengths: (d.strengths||[]).filter((_,i)=> i!==idx)}));
  const updateRow = (idx, key, val) => setData(d=> ({...d, strengths: (d.strengths||[]).map((r,i)=> i===idx? {...r, [key]: val}: r)}));

  const rows = data.strengths && data.strengths.length>0 ? data.strengths : [{ id:"", lengthIn: "", breakLoad: "", ageDays: "", psi: "" }];

  return (
    <div className="space-y-3">
      {rows.map((r, idx)=> (
        <div key={idx} className="rounded-lg border p-4 shadow-sm grid md:grid-cols-5 gap-3">
          <label className="label">Cylinder ID
            <input className="input mt-1 w-full" value={r.id}
                   onChange={e=> updateRow(idx, 'id', e.target.value)} />
          </label>
          <label className="label">Length (in)
            <input className="input mt-1 w-full" placeholder="e.g., 12" value={r.lengthIn}
                   onChange={e=> updateRow(idx, 'lengthIn', e.target.value)} />
          </label>
          <label className="label">Break Load (lb)
            <input className="input mt-1 w-full" placeholder="e.g., 55000" value={r.breakLoad}
                   onChange={e=> updateRow(idx, 'breakLoad', e.target.value)} />
          </label>
          <label className="label">Age (days)
            <input className="input mt-1 w-full" placeholder="e.g., 7" value={r.ageDays}
                   onChange={e=> updateRow(idx, 'ageDays', e.target.value)} />
          </label>
          <div className="flex items-end gap-2">
            <label className="label w-full">Strength (psi)
              <input className="input mt-1 w-full" placeholder="calculated or entered" value={r.psi}
                     onChange={e=> updateRow(idx, 'psi', e.target.value)} />
            </label>
            <button type="button" className="btn btn-ghost text-red-600" onClick={()=> removeRow(idx)}>−</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addRow}>+ Add Strength</button>
    </div>
  );
}
