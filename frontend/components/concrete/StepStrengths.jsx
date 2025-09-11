"use client";
export default function StepStrengths({ data, setData }) {
  const addRow = () => setData(d=> ({...d, strengths:[...d.strengths, { rowId:'', ageDays:'', testDate:'', diameterIn1:'', diameterIn2:'', lengthIn1:'', lengthIn2:'', lengthIn3:'', massGm:'', capType:'', totalLoadLbf:'', areaIn2:'', measuredStrengthPsi:'', specified28DayStrengthPsi:'', typeOfFracture:'', personPerformingTest:'', measuredDensityPcf:'' }]}));
  const removeRow = (i) => setData(d=> ({...d, strengths: d.strengths.filter((_,idx)=> idx!==i)}));

  return (
    <div className="space-y-4">
      {data.strengths.map((s,i)=> (
        <div key={i} className="rounded-md border p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white text-sm font-semibold">{s.rowId||String(i+1)}</span>
              <div className="text-sm text-gray-600">Row details</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn" onClick={()=> removeRow(i)}>− Remove</button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="label">Row
              <input className="input mt-1 w-full" value={s.rowId||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, rowId:e.target.value}:x) }))} />
            </label>
            <label className="label">Age (days)
              <input className="input mt-1 w-full" value={s.ageDays||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, ageDays:e.target.value}:x) }))} />
            </label>
            <label className="label">Test Date
              <input type="date" className="input mt-1 w-full" value={s.testDate||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, testDate:e.target.value}:x) }))} />
            </label>
          </div>
          <div className="mt-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Dimensions</div>
          <div className="grid md:grid-cols-6 gap-4 mt-2">
            <label className="label">Dia 1 (in)
              <input className="input mt-1 w-full" value={s.diameterIn1||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, diameterIn1:e.target.value}:x) }))} />
            </label>
            <label className="label">Dia 2 (in)
              <input className="input mt-1 w-full" value={s.diameterIn2||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, diameterIn2:e.target.value}:x) }))} />
            </label>
            <label className="label">Len 1 (in)
              <input className="input mt-1 w-full" value={s.lengthIn1||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, lengthIn1:e.target.value}:x) }))} />
            </label>
            <label className="label">Len 2 (in)
              <input className="input mt-1 w-full" value={s.lengthIn2||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, lengthIn2:e.target.value}:x) }))} />
            </label>
            <label className="label">Len 3 (in)
              <input className="input mt-1 w-full" value={s.lengthIn3||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, lengthIn3:e.target.value}:x) }))} />
            </label>
            <label className="label">Mass (gm)
              <input className="input mt-1 w-full" value={s.massGm||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, massGm:e.target.value}:x) }))} />
            </label>
          </div>
          <div className="mt-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Load & Geometry</div>
          <div className="grid md:grid-cols-4 gap-4 mt-2">
            <label className="label">Type of Cap
              <input className="input mt-1 w-full" value={s.capType||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, capType:e.target.value}:x) }))} />
            </label>
            <label className="label">Total Load (lbf)
              <input className="input mt-1 w-full" value={s.totalLoadLbf||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, totalLoadLbf:e.target.value}:x) }))} />
            </label>
            <label className="label">Area (in²)
              <input className="input mt-1 w-full" value={s.areaIn2||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, areaIn2:e.target.value}:x) }))} />
            </label>
            <label className="label">Measured Density (pcf)
              <input className="input mt-1 w-full" value={s.measuredDensityPcf||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, measuredDensityPcf:e.target.value}:x) }))} />
            </label>
          </div>
          <div className="mt-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Results</div>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <label className="label">Measured Strength (psi)
              <input className="input mt-1 w-full" value={s.measuredStrengthPsi||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, measuredStrengthPsi:e.target.value}:x) }))} />
            </label>
            <label className="label">Specified 28-day Strength (psi)
              <input className="input mt-1 w-full" value={s.specified28DayStrengthPsi||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, specified28DayStrengthPsi:e.target.value}:x) }))} />
            </label>
            <label className="label">Type of Fracture
              <input className="input mt-1 w-full" value={s.typeOfFracture||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, typeOfFracture:e.target.value}:x) }))} />
            </label>
            <label className="label">Person Performing Test
              <input className="input mt-1 w-full" value={s.personPerformingTest||''} onChange={e=> setData(d=> ({...d, strengths: d.strengths.map((x,idx)=> idx===i?{...x, personPerformingTest:e.target.value}:x) }))} />
            </label>
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={addRow}>+ Add Strength</button>
    </div>
  );
}
