"use client";
import { useEffect, useState } from 'react';
import { baseUrls } from '../../lib/api';
export default function StepReference({ data, setData }) {
  const { workflow, auth } = baseUrls();
  const [clients, setClients] = useState([]);
  const [trucks, setTrucks] = useState([]);
  useEffect(()=>{ (async()=>{
    try { const cs = await fetch(`${workflow}/masters/clients`, { cache:'no-store' }).then(r=> r.json()); setClients(cs||[]); } catch {}
    try { const ts = await fetch(`${workflow}/masters/trucks`, { cache:'no-store' }).then(r=> r.json()); setTrucks(ts||[]); } catch {}
  })(); }, [workflow]);
  const genId = (prefix) => `${prefix}-${new Date().toISOString().slice(2,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <label className="label">Cylinder ID
        <div className="flex gap-2 mt-1">
          <input className="input w-full" placeholder="auto or enter" value={data.cylinderId}
                 onChange={e=> setData(d=> ({...d, cylinderId:e.target.value}))} />
          <button type="button" className="btn" onClick={()=> setData(d=> ({...d, cylinderId: genId('CYL')}))}>Auto</button>
        </div>
      </label>
      <label className="label">Date
        <input type="date" className="input mt-1 w-full" value={data.date}
               onChange={e=> setData(d=> ({...d, date:e.target.value}))} />
      </label>
      <label className="label">Project No.
        <input className="input mt-1 w-full" value={data.projectNo}
               onChange={e=> setData(d=> ({...d, projectNo:e.target.value}))} />
      </label>
      <label className="label">Client
        <input list="client-list" className="input mt-1 w-full" value={data.client} onChange={e=> setData(d=> ({...d, client:e.target.value}))} />
        <datalist id="client-list">
          {clients.map(c=> <option key={c._id} value={c.name} />)}
        </datalist>
      </label>
      <label className="label">Project
        <input className="input mt-1 w-full" value={data.projectName}
               onChange={e=> setData(d=> ({...d, projectName:e.target.value}))} />
      </label>
      <label className="label">General Location
        <input className="input mt-1 w-full" value={data.generalLocation}
               onChange={e=> setData(d=> ({...d, generalLocation:e.target.value}))} />
      </label>
      <label className="label">Specific Location
        <input className="input mt-1 w-full" value={data.specificLocation}
               onChange={e=> setData(d=> ({...d, specificLocation:e.target.value}))} />
      </label>
      <label className="label">Mix ID
        <input className="input mt-1 w-full" value={data.mixId}
               onChange={e=> setData(d=> ({...d, mixId:e.target.value}))} />
      </label>
      <label className="label">Truck No.
        <input list="truck-list" className="input mt-1 w-full" value={data.truckNo}
               onChange={e=> setData(d=> ({...d, truckNo:e.target.value}))} />
        <datalist id="truck-list">
          {trucks.map(t=> <option key={t._id} value={t.truckNo}>{`${t.supplier||''} ${t.plant||''}`}</option>)}
        </datalist>
      </label>
      <label className="label">Ticket No.
        <div className="flex gap-2 mt-1">
          <input className="input w-full" placeholder="auto or enter" value={data.ticketNo}
                 onChange={e=> setData(d=> ({...d, ticketNo:e.target.value}))} />
          <button type="button" className="btn" onClick={()=> setData(d=> ({...d, ticketNo: genId('T')}))}>Auto</button>
        </div>
      </label>
      <label className="label">Supplier
        <input className="input mt-1 w-full" value={data.supplier}
               onChange={e=> setData(d=> ({...d, supplier:e.target.value}))} />
      </label>
      <label className="label">Plant
        <input className="input mt-1 w-full" value={data.plant}
               onChange={e=> setData(d=> ({...d, plant:e.target.value}))} />
      </label>
      <label className="label">Sampled by
        <input className="input mt-1 w-full" list="user-list" value={data.sampledBy} onChange={e=> setData(d=> ({...d, sampledBy:e.target.value}))} />
      </label>
      <label className="label">Sample Time
        <input className="input mt-1 w-full" placeholder="HH:MM" value={data.sampleTime}
               onChange={e=> setData(d=> ({...d, sampleTime:e.target.value}))} />
      </label>
      <label className="label">Batch Time
        <input className="input mt-1 w-full" placeholder="HH:MM" value={data.batchTime}
               onChange={e=> setData(d=> ({...d, batchTime:e.target.value}))} />
      </label>
      <label className="label">Time Truck Finished Unloading
        <input className="input mt-1 w-full" placeholder="HH:MM" value={data.timeTruckFinished}
               onChange={e=> setData(d=> ({...d, timeTruckFinished:e.target.value}))} />
      </label>
      <label className="label">Ambient Temp (°F)
        <input className="input mt-1 w-full" placeholder="e.g., 72" value={data.ambientTempF}
               onChange={e=> setData(d=> ({...d, ambientTempF:e.target.value}))} />
      </label>
      <label className="label">Yards in load
        <input className="input mt-1 w-full" placeholder="e.g., 8.5" value={data.yardsInLoad}
               onChange={e=> setData(d=> ({...d, yardsInLoad:e.target.value}))} />
      </label>
      <label className="label">Cumulative Yards Placed
        <input className="input mt-1 w-full" placeholder="e.g., 32" value={data.cumulativeYardsPlaced}
               onChange={e=> setData(d=> ({...d, cumulativeYardsPlaced:e.target.value}))} />
      </label>
      <label className="label">Water Added (gals)
        <input className="input mt-1 w-full" value={data.waterAddedGal}
               onChange={e=> setData(d=> ({...d, waterAddedGal:e.target.value}))} />
      </label>
      <label className="label">Water/Cement Ratio
        <input className="input mt-1 w-full" placeholder="e.g., 0.45" value={data.waterCementRatio}
               onChange={e=> setData(d=> ({...d, waterCementRatio:e.target.value}))} />
      </label>
    </div>
  );
}
