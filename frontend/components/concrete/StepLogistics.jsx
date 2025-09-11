"use client";
import { useState } from "react";

export default function StepLogistics({ data, setData }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="label">Tested By
          <input className="input mt-1 w-full" value={data.testedBy} onChange={e=> setData(d=> ({...d, testedBy:e.target.value}))} />
        </label>
        <label className="label">Field Representative
          <input className="input mt-1 w-full" value={data.fieldRepresentative} onChange={e=> setData(d=> ({...d, fieldRepresentative:e.target.value}))} />
        </label>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <label className="label">Comp. Machine ID
          <input className="input mt-1 w-full" value={data.compMachineId} onChange={e=> setData(d=> ({...d, compMachineId:e.target.value}))} />
        </label>
        <label className="label">Caliper ID
          <input className="input mt-1 w-full" value={data.caliperId} onChange={e=> setData(d=> ({...d, caliperId:e.target.value}))} />
        </label>
        <label className="label">Scale ID
          <input className="input mt-1 w-full" value={data.compScaleId} onChange={e=> setData(d=> ({...d, compScaleId:e.target.value}))} />
        </label>
        <label className="label">Ret. Rings
          <input className="input mt-1 w-full" value={data.retRings} onChange={e=> setData(d=> ({...d, retRings:e.target.value}))} />
        </label>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <label className="label">Cast In Field
          <input type="checkbox" className="ml-2" checked={data.cylindersCastInField} onChange={e=> setData(d=> ({...d, cylindersCastInField:e.target.checked}))} />
        </label>
        <label className="label">Cast In Lab
          <input type="checkbox" className="ml-2" checked={data.cylindersCastInLab} onChange={e=> setData(d=> ({...d, cylindersCastInLab:e.target.checked}))} />
        </label>
        <label className="label">Time Cylinders Molded
          <input className="input mt-1 w-full" value={data.timeCylindersMolded} onChange={e=> setData(d=> ({...d, timeCylindersMolded:e.target.value}))} />
        </label>
        <label className="label">First 24h Temp Range
          <input className="input mt-1 w-full" placeholder="e.g., 68–74°F" value={data.cylindersTempRangeFirst24h} onChange={e=> setData(d=> ({...d, cylindersTempRangeFirst24h:e.target.value}))} />
        </label>
        <label className="label">Cylinders Cured At
          <input className="input mt-1 w-full" placeholder="e.g., Field/Lab" value={data.whereCylindersCured} onChange={e=> setData(d=> ({...d, whereCylindersCured:e.target.value}))} />
        </label>
        <label className="label">Field placement observations
          <input className="input mt-1 w-full" placeholder="Short notes" value={data.fieldPlacementObservations} onChange={e=> setData(d=> ({...d, fieldPlacementObservations:e.target.value}))} />
        </label>
        <label className="label">Remarks
          <input className="input mt-1 w-full" placeholder="Optional" value={data.remarks} onChange={e=> setData(d=> ({...d, remarks:e.target.value}))} />
        </label>
      </div>
      <div>
        <button type="button" className="btn" onClick={()=> setShowAdvanced(s=> !s)}>
          {showAdvanced ? '− Hide advanced logistics' : '+ Show advanced logistics'}
        </button>
      </div>
      {showAdvanced && (
        <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
          <label className="label">Date Received in Lab
            <input type="date" className="input mt-1 w-full" value={data.dateCylindersReceivedInLab} onChange={e=> setData(d=> ({...d, dateCylindersReceivedInLab:e.target.value}))} />
          </label>
          <label className="label">Pick up by
            <input className="input mt-1 w-full" placeholder="Name / Company" value={data.pickUpBy} onChange={e=> setData(d=> ({...d, pickUpBy:e.target.value}))} />
          </label>
          <label className="label">Cylinders condition
            <select className="input mt-1 w-full" value={data.cylindersCondition} onChange={e=> setData(d=> ({...d, cylindersCondition:e.target.value}))}>
              <option value=""></option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </label>
          <label className="label">Chargeable Time
            <input className="input mt-1 w-full" placeholder="e.g., 1.5 h" value={data.chargeableTime} onChange={e=> setData(d=> ({...d, chargeableTime:e.target.value}))} />
          </label>
          <label className="label">Test pick up (h)
            <input className="input mt-1 w-full" value={data.testPickUpHours} onChange={e=> setData(d=> ({...d, testPickUpHours:e.target.value}))} />
          </label>
          <label className="label">Test pick up (min)
            <input className="input mt-1 w-full" value={data.testPickUpMinutes||''} onChange={e=> setData(d=> ({...d, testPickUpMinutes:e.target.value}))} />
          </label>
          <label className="label">Delayed (h)
            <input className="input mt-1 w-full" value={data.delayedHours} onChange={e=> setData(d=> ({...d, delayedHours:e.target.value}))} />
          </label>
          <label className="label">Delayed (min)
            <input className="input mt-1 w-full" value={data.delayedMinutes||''} onChange={e=> setData(d=> ({...d, delayedMinutes:e.target.value}))} />
          </label>
          <label className="label">Why?
            <input className="input mt-1 w-full" value={data.delayedWhy} onChange={e=> setData(d=> ({...d, delayedWhy:e.target.value}))} />
          </label>
        </div>
      )}
      <label className="label block">Notes
        <textarea className="input mt-1 w-full h-24" value={data.notes} onChange={e=> setData(d=> ({...d, notes:e.target.value}))} />
      </label>
    </div>
  );
}
