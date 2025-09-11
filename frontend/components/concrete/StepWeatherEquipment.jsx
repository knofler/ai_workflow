"use client";
export default function StepWeatherEquipment({ data, setData }) {
  const addAdmix = () => setData(d=> ({...d, admixtures: [...(d.admixtures||[]), { name: "", dosage: "" }]}));
  const removeAdmix = (idx) => setData(d=> ({...d, admixtures: (d.admixtures||[]).filter((_,i)=> i!==idx)}));
  const updateAdmix = (idx, key, val) => setData(d=> ({...d, admixtures: (d.admixtures||[]).map((a,i)=> i===idx? {...a, [key]: val}: a)}));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold">Weather</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-2">
          <label className="label">Weather
            <input className="input mt-1 w-full" placeholder="Sunny/Overcast/Rainy" value={data.weather}
                   onChange={e=> setData(d=> ({...d, weather:e.target.value}))} />
          </label>
          <label className="label">Est. Wind (mph)
            <input className="input mt-1 w-full" placeholder="e.g., 10" value={data.estWindMph}
                   onChange={e=> setData(d=> ({...d, estWindMph:e.target.value}))} />
          </label>
          <label className="label">Est. RH (%)
            <input className="input mt-1 w-full" placeholder="e.g., 55" value={data.estRhPct}
                   onChange={e=> setData(d=> ({...d, estRhPct:e.target.value}))} />
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Equipment</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-2">
          <label className="label">Slump Cone ID
            <input className="input mt-1 w-full" value={data.slumpConeId}
                   onChange={e=> setData(d=> ({...d, slumpConeId:e.target.value}))} />
          </label>
          <label className="label">Thermometer ID
            <input className="input mt-1 w-full" value={data.thermometerId}
                   onChange={e=> setData(d=> ({...d, thermometerId:e.target.value}))} />
          </label>
          <label className="label">Air Meter ID
            <input className="input mt-1 w-full" value={data.airMeterId}
                   onChange={e=> setData(d=> ({...d, airMeterId:e.target.value}))} />
          </label>
          <label className="label">Unit Weight Measure ID
            <input className="input mt-1 w-full" value={data.unitWeightMeasureId}
                   onChange={e=> setData(d=> ({...d, unitWeightMeasureId:e.target.value}))} />
          </label>
          <label className="label">Scale ID
            <input className="input mt-1 w-full" value={data.scaleId}
                   onChange={e=> setData(d=> ({...d, scaleId:e.target.value}))} />
          </label>
        </div>
      </section>

  {/* Admixtures are edited in Physical step */}
    </div>
  );
}
