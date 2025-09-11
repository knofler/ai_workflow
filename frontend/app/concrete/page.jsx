"use client";
import { useState } from 'react';
import Card from '../../components/Card';
import { baseUrls, jsonFetch } from '../../lib/api';

export default function ConcreteFormPage() {
  const { workflow } = baseUrls();
  const [data, setData] = useState({
    date: new Date().toISOString().slice(0,10),
    client: '', projectNo:'', projectName:'', weather:'',
    supplier:'', truckNo:'', ticketNo:'', mixDesign:'', placementLocation:'',
    slumpIn:'', airContentPct:'', unitWeightPcf:'', tempConcreteF:'', ambientTempF:'', waterAddedGal:'', admixtures:'',
    testedBy:'', fieldRepresentative:'', notes:'',
    cylinders:[{ qty:'', sizeIn:'6', ageDays:'7', ids:'' }]
  });
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const r = await jsonFetch(`${workflow}/concrete`, { method:'POST', body: JSON.stringify(data) });
      setResult(r);
    } catch (e) { setErr(String(e.message||e)); }
  };

  const addCyl = () => setData(d=> ({ ...d, cylinders: [...d.cylinders, { qty:'', sizeIn:'6', ageDays:'28', ids:'' }] }));
  const delCyl = (i) => setData(d=> ({ ...d, cylinders: d.cylinders.filter((_,idx)=> idx!==i) }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card title="Concrete Field Form" action={<button className="btn" onClick={submit}>Submit</button>}>
        <form className="space-y-6" onSubmit={submit}>
          <section>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="label">Date
                <input type="date" className="input mt-1 w-full" value={data.date} onChange={e=> setData(d=> ({...d, date:e.target.value}))} />
              </label>
              <label className="label">Client
                <input className="input mt-1 w-full" value={data.client} onChange={e=> setData(d=> ({...d, client:e.target.value}))} />
              </label>
              <label className="label">Project No
                <input className="input mt-1 w-full" value={data.projectNo} onChange={e=> setData(d=> ({...d, projectNo:e.target.value}))} />
              </label>
              <label className="label">Project Name
                <input className="input mt-1 w-full" value={data.projectName} onChange={e=> setData(d=> ({...d, projectName:e.target.value}))} />
              </label>
              <label className="label">Weather
                <input className="input mt-1 w-full" value={data.weather} onChange={e=> setData(d=> ({...d, weather:e.target.value}))} />
              </label>
            </div>
          </section>

          <section>
            <div className="section-header">Delivery / Mix</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
              <label className="label">Supplier
                <input className="input mt-1 w-full" value={data.supplier} onChange={e=> setData(d=> ({...d, supplier:e.target.value}))} />
              </label>
              <label className="label">Truck #
                <input className="input mt-1 w-full" value={data.truckNo} onChange={e=> setData(d=> ({...d, truckNo:e.target.value}))} />
              </label>
              <label className="label">Ticket #
                <input className="input mt-1 w-full" value={data.ticketNo} onChange={e=> setData(d=> ({...d, ticketNo:e.target.value}))} />
              </label>
              <label className="label">Mix Design
                <input className="input mt-1 w-full" value={data.mixDesign} onChange={e=> setData(d=> ({...d, mixDesign:e.target.value}))} />
              </label>
              <label className="label">Placement Location
                <input className="input mt-1 w-full" value={data.placementLocation} onChange={e=> setData(d=> ({...d, placementLocation:e.target.value}))} />
              </label>
            </div>
          </section>

          <section>
            <div className="section-header">Fresh Properties</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
              <label className="label">Slump (in)
                <input className="input mt-1 w-full" value={data.slumpIn} onChange={e=> setData(d=> ({...d, slumpIn:e.target.value}))} />
              </label>
              <label className="label">Air Content (%)
                <input className="input mt-1 w-full" value={data.airContentPct} onChange={e=> setData(d=> ({...d, airContentPct:e.target.value}))} />
              </label>
              <label className="label">Unit Weight (pcf)
                <input className="input mt-1 w-full" value={data.unitWeightPcf} onChange={e=> setData(d=> ({...d, unitWeightPcf:e.target.value}))} />
              </label>
              <label className="label">Concrete Temp (F)
                <input className="input mt-1 w-full" value={data.tempConcreteF} onChange={e=> setData(d=> ({...d, tempConcreteF:e.target.value}))} />
              </label>
              <label className="label">Ambient Temp (F)
                <input className="input mt-1 w-full" value={data.ambientTempF} onChange={e=> setData(d=> ({...d, ambientTempF:e.target.value}))} />
              </label>
              <label className="label">Water Added (gal)
                <input className="input mt-1 w-full" value={data.waterAddedGal} onChange={e=> setData(d=> ({...d, waterAddedGal:e.target.value}))} />
              </label>
              <label className="label">Admixtures
                <input className="input mt-1 w-full" value={data.admixtures} onChange={e=> setData(d=> ({...d, admixtures:e.target.value}))} />
              </label>
            </div>
          </section>

          <section>
            <div className="section-header">Cylinders Cast</div>
            <div className="p-4 border rounded-b-md">
              <table className="table w-full">
                <thead><tr><th>Qty</th><th>Size (in)</th><th>Age (days)</th><th>IDs</th><th></th></tr></thead>
                <tbody>
                  {data.cylinders.map((c,i)=> (
                    <tr key={i}>
                      <td><input className="input w-full" value={c.qty} onChange={e=> setData(d=> ({...d, cylinders: d.cylinders.map((x,idx)=> idx===i?{...x, qty:e.target.value}:x) }))} /></td>
                      <td><input className="input w-full" value={c.sizeIn} onChange={e=> setData(d=> ({...d, cylinders: d.cylinders.map((x,idx)=> idx===i?{...x, sizeIn:e.target.value}:x) }))} /></td>
                      <td><input className="input w-full" value={c.ageDays} onChange={e=> setData(d=> ({...d, cylinders: d.cylinders.map((x,idx)=> idx===i?{...x, ageDays:e.target.value}:x) }))} /></td>
                      <td><input className="input w-full" value={c.ids} onChange={e=> setData(d=> ({...d, cylinders: d.cylinders.map((x,idx)=> idx===i?{...x, ids:e.target.value}:x) }))} /></td>
                      <td className="text-right"><button type="button" className="btn" onClick={()=> delCyl(i)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2"><button type="button" className="btn" onClick={addCyl}>+ Add row</button></div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="label">Tested By
                <input className="input mt-1 w-full" value={data.testedBy} onChange={e=> setData(d=> ({...d, testedBy:e.target.value}))} />
              </label>
              <label className="label">Field Representative
                <input className="input mt-1 w-full" value={data.fieldRepresentative} onChange={e=> setData(d=> ({...d, fieldRepresentative:e.target.value}))} />
              </label>
            </div>
            <label className="label block mt-4">Notes
              <textarea className="input mt-1 w-full h-24" value={data.notes} onChange={e=> setData(d=> ({...d, notes:e.target.value}))} />
            </label>
          </section>
        </form>
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>

      {result && (
        <Card title="Submitted">
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          <a className="btn mt-3 inline-block" href={`/concrete/${result._id}`}>Open Report</a>
        </Card>
      )}
      <style jsx>{`
        .section-header { background:#3949ab; color:#fff; padding:6px 10px; border-radius:6px 6px 0 0; font-weight:600; letter-spacing:0.02em; }
      `}</style>
    </div>
  );
}
