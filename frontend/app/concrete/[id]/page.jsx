export default async function ConcreteReport({ params }) {
  const base = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const workflow = base.replace(':4000', ':5002');
  const doc = await fetch(`${workflow}/concrete/${params.id}`, { cache: 'no-store' }).then(r=> r.json());
  return (
    <div className="max-w-5xl mx-auto p-6 text-[13px]">
      <h1 className="text-xl font-semibold mb-4">Report of Field Inspection of Concrete — Single Mix</h1>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>Client: <b>{doc.client}</b></div>
        <div>Date: <b>{doc.date ? new Date(doc.date).toLocaleDateString() : ''}</b></div>
        <div>Project: <b>{doc.projectNo} — {doc.projectName}</b></div>
        <div>General Location: <b>{doc.generalLocation}</b></div>
        <div>Specific Location: <b>{doc.specificLocation}</b></div>
        <div>Weather: <b>{doc.weather}</b></div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Reference & Delivery</div>
        <div className="grid grid-cols-3 gap-2">
          <div>Mix ID: <b>{doc.mixId}</b></div>
          <div>Cylinder ID: <b>{doc.cylinderId}</b></div>
          <div>Truck: <b>{doc.truckNo}</b></div>
          <div>Ticket: <b>{doc.ticketNo}</b></div>
          <div>Batch Time: <b>{doc.batchTime}</b></div>
          <div>Sample Time: <b>{doc.sampleTime}</b></div>
          <div>Truck Finished: <b>{doc.timeTruckFinished}</b></div>
          <div>Supplier: <b>{doc.supplier}</b></div>
          <div>Plant: <b>{doc.plant}</b></div>
          <div>Sampled By: <b>{doc.sampledBy}</b></div>
          <div>Placement: <b>{doc.placementLocation}</b></div>
          <div>Ambient Temp (F): <b>{doc.ambientTempF}</b></div>
          <div>Yards in load: <b>{doc.yardsInLoad}</b></div>
          <div>Cumulative yards placed: <b>{doc.cumulativeYardsPlaced}</b></div>
          <div>Water/Cement Ratio: <b>{doc.waterCementRatio}</b></div>
          <div>Est. Wind (mph): <b>{doc.estWindMph}</b></div>
          <div>Est. RH (%): <b>{doc.estRhPct}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Physical Properties</div>
        <div className="grid grid-cols-3 gap-2">
          <div>Air Content (%): <b>{doc.airContentPct}</b> <span className="text-zinc-500">(spec {doc.specAirMin}–{doc.specAirMax})</span></div>
          <div>Slump (in): <b>{doc.slumpIn}</b> <span className="text-zinc-500">(spec {doc.specSlumpMin}–{doc.specSlumpMax})</span></div>
          <div>Concrete Temp (F): <b>{doc.tempConcreteF}</b> <span className="text-zinc-500">(spec {doc.specTempMin}–{doc.specTempMax})</span></div>
          <div>Unit Weight (pcf): <b>{doc.unitWeightPcf}</b></div>
          <div>Yield (CY): <b>{doc.yieldCY}</b></div>
          <div>Relative Yield: <b>{doc.relativeYield}</b></div>
          <div>Mix Design Strength (psi): <b>{doc.mixDesignStrengthPsi}</b></div>
          <div>Required Strength (psi): <b>{doc.requiredStrengthPsi}</b></div>
          <div>Water Added (gal): <b>{doc.waterAddedGal}</b></div>
        </div>
        <div className="grid grid-cols-6 gap-2 mt-2">
          <div>Cement (lb): <b>{doc.cementLb}</b></div>
          <div>Other Cem. (lb): <b>{doc.otherCementitiousLb}</b></div>
          <div>Water (lb): <b>{doc.waterLb}</b></div>
          <div>Excess H2O Coarse (lb): <b>{doc.excessWaterCoarseLb}</b></div>
          <div>Excess H2O Fine (lb): <b>{doc.excessWaterFineLb}</b></div>
          <div>Fine Agg. (lb): <b>{doc.fineAggregateLb}</b></div>
          <div>Course Agg. 1 (lb): <b>{doc.coarseAggregate1Lb}</b></div>
          <div>Course Agg. 2 (lb): <b>{doc.coarseAggregate2Lb}</b></div>
          <div>Max Agg Size (in): <b>{doc.maxAggregateSizeIn}</b></div>
          <div>Admix1: <b>{doc.admixture1Type} {doc.admixture1Oz ? `(${doc.admixture1Oz} oz)` : ''}</b></div>
          <div>Admix2: <b>{doc.admixture2Type} {doc.admixture2Oz ? `(${doc.admixture2Oz} oz)` : ''}</b></div>
          <div>Admix3: <b>{doc.admixture3Type} {doc.admixture3Oz ? `(${doc.admixture3Oz} oz)` : ''}</b></div>
          <div>Total Batch Wt (lb): <b>{doc.totalBatchWeightLb}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Equipment IDs</div>
        <div className="grid grid-cols-5 gap-2">
          <div>Slump Cone: <b>{doc.slumpConeId}</b></div>
          <div>Thermometer: <b>{doc.thermometerId}</b></div>
          <div>Air Meter: <b>{doc.airMeterId}</b></div>
          <div>Unit Weight Measure: <b>{doc.unitWeightMeasureId}</b></div>
          <div>Scale: <b>{doc.scaleId}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Compressive Strengths</div>
        <div className="overflow-x-auto">
          <table className="table w-full text-[12px]">
            <thead>
              <tr>
                <th>Row</th><th>Age</th><th>Test Date</th><th>Dia 1</th><th>Dia 2</th><th>Len 1</th><th>Len 2</th><th>Mass (gm)</th><th>Cap</th><th>Total Load (lbf)</th><th>Area (in²)</th><th>Strength (psi)</th><th>28d Spec</th><th>Fracture</th><th>Person</th><th>Density (pcf)</th>
              </tr>
            </thead>
            <tbody>
              {(doc.strengths||[]).map((s,i)=> (
                <tr key={i}>
                  <td>{s.rowId}</td>
                  <td>{s.ageDays}</td>
                  <td>{s.testDate ? new Date(s.testDate).toLocaleDateString() : ''}</td>
                  <td>{s.diameterIn1}</td>
                  <td>{s.diameterIn2}</td>
                  <td>{s.lengthIn1}</td>
                  <td>{s.lengthIn2}</td>
                  <td>{s.massGm}</td>
                  <td>{s.capType}</td>
                  <td>{s.totalLoadLbf}</td>
                  <td>{s.areaIn2}</td>
                  <td>{s.measuredStrengthPsi}</td>
                  <td>{s.specified28DayStrengthPsi}</td>
                  <td>{s.typeOfFracture}</td>
                  <td>{s.personPerformingTest}</td>
                  <td>{s.measuredDensityPcf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Testing & Logistics</div>
        <div className="grid grid-cols-4 gap-2">
          <div>Comp. Machine: <b>{doc.compMachineId}</b></div>
          <div>Caliper: <b>{doc.caliperId}</b></div>
          <div>Scale: <b>{doc.compScaleId}</b></div>
          <div>Ret. Rings: <b>{doc.retRings}</b></div>
          <div>Cast in Field: <b>{doc.cylindersCastInField ? 'Yes' : 'No'}</b></div>
          <div>Cast in Lab: <b>{doc.cylindersCastInLab ? 'Yes' : 'No'}</b></div>
          <div>Time Molded: <b>{doc.timeCylindersMolded}</b></div>
          <div>First 24h Temp: <b>{doc.cylindersTempRangeFirst24h}</b></div>
          <div>Cured At: <b>{doc.whereCylindersCured}</b></div>
          <div>Date Received in Lab: <b>{doc.dateCylindersReceivedInLab ? new Date(doc.dateCylindersReceivedInLab).toLocaleDateString() : ''}</b></div>
          <div>Pick up by: <b>{doc.pickUpBy}</b></div>
          <div>Condition: <b>{doc.cylindersCondition}</b></div>
          <div>Chargeable Time: <b>{doc.chargeableTime}</b></div>
          <div>Test pick up (h): <b>{doc.testPickUpHours}</b></div>
          <div>Delayed (h): <b>{doc.delayedHours}</b></div>
          <div>Why: <b>{doc.delayedWhy}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>Tested By: <b>{doc.testedBy}</b></div>
          <div>Field Rep: <b>{doc.fieldRepresentative}</b></div>
        </div>
        <div className="text-sm text-zinc-700">Notes: {doc.notes}</div>
      </div>
      <div className="mt-4"><a className="btn" href="#" onClick={(e)=>{e.preventDefault(); if (typeof window!== 'undefined') window.print();}}>Print</a></div>
    </div>
  );
}
