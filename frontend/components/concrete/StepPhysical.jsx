"use client";
export default function StepPhysical({ data, setData }) {
  const addAdmix = () => setData(d=> ({ ...d, admixtures: [...(d.admixtures||[]), { type:'', oz:'' }] }));
  const delAdmix = (i) => setData(d=> ({ ...d, admixtures: (d.admixtures||[]).filter((_,idx)=> idx!==i) }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <label className="label">Slump (in)
          <input className="input mt-1 w-full" value={data.slumpIn} onChange={e=> setData(d=> ({...d, slumpIn:e.target.value}))} />
        </label>
        <label className="label">Slump Spec Min
          <input className="input mt-1 w-full" value={data.specSlumpMin} onChange={e=> setData(d=> ({...d, specSlumpMin:e.target.value}))} />
        </label>
        <label className="label">Slump Spec Max
          <input className="input mt-1 w-full" value={data.specSlumpMax} onChange={e=> setData(d=> ({...d, specSlumpMax:e.target.value}))} />
        </label>
        <label className="label">Air Content (%)
          <input className="input mt-1 w-full" placeholder="e.g., 6.5" value={data.airContentPct} onChange={e=> setData(d=> ({...d, airContentPct:e.target.value}))} />
        </label>
        <label className="label">Air Spec Min (%)
          <input className="input mt-1 w-full" value={data.specAirMin} onChange={e=> setData(d=> ({...d, specAirMin:e.target.value}))} />
        </label>
        <label className="label">Air Spec Max (%)
          <input className="input mt-1 w-full" value={data.specAirMax} onChange={e=> setData(d=> ({...d, specAirMax:e.target.value}))} />
        </label>
        <label className="label">Unit Weight (pcf)
          <input className="input mt-1 w-full" placeholder="e.g., 145" value={data.unitWeightPcf} onChange={e=> setData(d=> ({...d, unitWeightPcf:e.target.value}))} />
        </label>
        <label className="label">Concrete Temp (F)
          <input className="input mt-1 w-full" placeholder="e.g., 70" value={data.tempConcreteF} onChange={e=> setData(d=> ({...d, tempConcreteF:e.target.value}))} />
        </label>
        <label className="label">Ambient Temp (F)
          <input className="input mt-1 w-full" value={data.ambientTempF} onChange={e=> setData(d=> ({...d, ambientTempF:e.target.value}))} />
        </label>
        <label className="label">Water Added (gal)
          <input className="input mt-1 w-full" value={data.waterAddedGal} onChange={e=> setData(d=> ({...d, waterAddedGal:e.target.value}))} />
        </label>
        <label className="label">Yield (CY)
          <input className="input mt-1 w-full" value={data.yieldCY} onChange={e=> setData(d=> ({...d, yieldCY:e.target.value}))} />
        </label>
        <label className="label">Relative Yield
          <input className="input mt-1 w-full" value={data.relativeYield} onChange={e=> setData(d=> ({...d, relativeYield:e.target.value}))} />
        </label>
        <label className="label">Mix Design Strength (psi)
          <input className="input mt-1 w-full" value={data.mixDesignStrengthPsi} onChange={e=> setData(d=> ({...d, mixDesignStrengthPsi:e.target.value}))} />
        </label>
        <label className="label">Required Strength (psi)
          <input className="input mt-1 w-full" value={data.requiredStrengthPsi} onChange={e=> setData(d=> ({...d, requiredStrengthPsi:e.target.value}))} />
        </label>
      </div>

      <div className="grid md:grid-cols-6 gap-4">
        <label className="label">Cement (lb)
          <input className="input mt-1 w-full" value={data.cementLb} onChange={e=> setData(d=> ({...d, cementLb:e.target.value}))} />
        </label>
        <label className="label">Other Cementitious (lb)
          <input className="input mt-1 w-full" value={data.otherCementitiousLb} onChange={e=> setData(d=> ({...d, otherCementitiousLb:e.target.value}))} />
        </label>
        <label className="label">Water (lb)
          <input className="input mt-1 w-full" value={data.waterLb} onChange={e=> setData(d=> ({...d, waterLb:e.target.value}))} />
        </label>
        <label className="label">Excess Water (Coarse) (lb)
          <input className="input mt-1 w-full" value={data.excessWaterCoarseLb} onChange={e=> setData(d=> ({...d, excessWaterCoarseLb:e.target.value}))} />
        </label>
        <label className="label">Excess Water (Fine) (lb)
          <input className="input mt-1 w-full" value={data.excessWaterFineLb} onChange={e=> setData(d=> ({...d, excessWaterFineLb:e.target.value}))} />
        </label>
        <label className="label">Fine Aggregate (lb)
          <input className="input mt-1 w-full" value={data.fineAggregateLb} onChange={e=> setData(d=> ({...d, fineAggregateLb:e.target.value}))} />
        </label>
        <label className="label">Course Aggregate 1 (lb)
          <input className="input mt-1 w-full" value={data.coarseAggregate1Lb} onChange={e=> setData(d=> ({...d, coarseAggregate1Lb:e.target.value}))} />
        </label>
        <label className="label">Course Aggregate 2 (lb)
          <input className="input mt-1 w-full" value={data.coarseAggregate2Lb} onChange={e=> setData(d=> ({...d, coarseAggregate2Lb:e.target.value}))} />
        </label>
        <label className="label">Max Aggregate Size (in)
          <input list="maxAggregateSizeIn-list" className="input mt-1 w-full" value={data.maxAggregateSizeIn} onChange={e=> setData(d=> ({...d, maxAggregateSizeIn:e.target.value}))} />
        </label>
        <label className="label">Total Batch Weight (lb)
          <input className="input mt-1 w-full" value={data.totalBatchWeightLb} onChange={e=> setData(d=> ({...d, totalBatchWeightLb:e.target.value}))} />
        </label>
      </div>

      <div className="md:col-span-6">
        <div className="text-sm font-semibold text-gray-700 mb-2">Admixtures</div>
        <div className="space-y-3">
          {(data.admixtures||[]).map((a,i)=> (
            <div key={i} className="grid md:grid-cols-6 gap-4 items-end">
              <label className="label md:col-span-2">Type
                <input className="input mt-1 w-full" value={a.type} onChange={e=> setData(d=> ({...d, admixtures: d.admixtures.map((x,idx)=> idx===i?{...x, type:e.target.value}:x) }))} />
              </label>
              <label className="label md:col-span-2">Amount (oz)
                <input className="input mt-1 w-full" value={a.oz} onChange={e=> setData(d=> ({...d, admixtures: d.admixtures.map((x,idx)=> idx===i?{...x, oz:e.target.value}:x) }))} />
              </label>
              <div className="md:col-span-2 text-right">
                <button type="button" className="btn" onClick={()=> delAdmix(i)}>− Remove</button>
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="btn" onClick={addAdmix}>+ Add Admixture</button>
          </div>
        </div>
      </div>
    </div>
  );
}
