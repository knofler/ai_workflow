"use client";
import { useState } from 'react';
import Card from '../../components/Card';
import { baseUrls, jsonFetch } from '../../lib/api';
import { EQUIPMENT_DEFAULTS, EQUIPMENT_SUGGESTIONS, SPEC_DEFAULTS } from '../../lib/concreteDefaults';

export default function ConcreteFormPage() {
  const { workflow } = baseUrls();
  const [data, setData] = useState({
    date: new Date().toISOString().slice(0,10),
  client: '', projectNo:'', projectName:'', generalLocation:'', specificLocation:'', weather:'',
  cylinderId:'', mixId:'', truckNo:'', ticketNo:'', supplier:'', plant:'', sampledBy:'',
  batchTime:'', sampleTime:'', timeTruckFinished:'',
  ambientTempF:'', yardsInLoad:'', cumulativeYardsPlaced:'', waterAddedGal:'', waterCementRatio:'',
  estWindMph:'', estRhPct:'',
    // Physical properties and specs
    airContentPct:'', specAirMin:'', specAirMax:'',
    slumpIn:'', specSlumpMin:'', specSlumpMax:'',
  tempConcreteF:'', specTempMin: SPEC_DEFAULTS.specTempMin, specTempMax: SPEC_DEFAULTS.specTempMax,
    unitWeightPcf:'', yieldCY:'', relativeYield:'',
    mixDesignStrengthPsi:'', requiredStrengthPsi:'',
    cementLb:'', otherCementitiousLb:'', waterLb:'', excessWaterCoarseLb:'', excessWaterFineLb:'',
  fineAggregateLb:'', coarseAggregate1Lb:'', coarseAggregate2Lb:'',
  maxAggregateSizeIn: EQUIPMENT_DEFAULTS.maxAggregateSizeIn, admixture1Type:'', admixture1Oz:'', admixture2Type:'', admixture2Oz:'', admixture3Type:'', admixture3Oz:'', totalBatchWeightLb:'',
    // Equipment IDs
  slumpConeId: EQUIPMENT_DEFAULTS.slumpConeId,
  thermometerId: EQUIPMENT_DEFAULTS.thermometerId,
  airMeterId: EQUIPMENT_DEFAULTS.airMeterId,
  unitWeightMeasureId: EQUIPMENT_DEFAULTS.unitWeightMeasureId,
  scaleId: EQUIPMENT_DEFAULTS.scaleId,
    // Cylinders table
    cylinders:[{ qty:'', sizeIn:'6', ageDays:'7', ids:'' }],
    // Strengths grid scaffold (A..G rows)
  strengths:['A','B','C','D','E','F','G'].map(r=> ({ rowId:r, ageDays:'', testDate:'', diameterIn1:'', diameterIn2:'', lengthIn1:'', lengthIn2:'', lengthIn3:'', massGm:'', capType:'', totalLoadLbf:'', areaIn2:'', measuredStrengthPsi:'', specified28DayStrengthPsi:'', typeOfFracture:'', personPerformingTest:'', measuredDensityPcf:'' })),
    // People/notes
    testedBy:'', fieldRepresentative:'', notes:'',
    // Bottom equipment/logistics
  compMachineId: EQUIPMENT_DEFAULTS.compMachineId,
  caliperId: EQUIPMENT_DEFAULTS.caliperId,
  compScaleId: EQUIPMENT_DEFAULTS.compScaleId,
  retRings: EQUIPMENT_DEFAULTS.retRings,
    cylindersCastInField:false, cylindersCastInLab:false,
  timeCylindersMolded:'', cylindersTempRangeFirst24h:'', whereCylindersCured:'', fieldPlacementObservations:'', remarks:'',
  dateCylindersReceivedInLab:'', pickUpBy:'', cylindersCondition:'', chargeableTime:'', testPickUpHours:'', testPickUpMinutes:'', delayedHours:'', delayedMinutes:'', delayedWhy:''
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card title="Report of Field Inspection of Concrete – Single Mix" action={<button className="btn" onClick={submit}>Submit</button>}>
        <form className="space-y-6" onSubmit={submit}>
          <section>
            <div className="section-header">Reference Data</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
              <label className="label">Cylinder ID
                <input className="input mt-1 w-full" value={data.cylinderId} onChange={e=> setData(d=> ({...d, cylinderId:e.target.value}))} />
              </label>
              <label className="label">Date
                <input type="date" className="input mt-1 w-full" value={data.date} onChange={e=> setData(d=> ({...d, date:e.target.value}))} />
              </label>
              <label className="label">Project No.
                <input className="input mt-1 w-full" value={data.projectNo} onChange={e=> setData(d=> ({...d, projectNo:e.target.value}))} />
              </label>
              <label className="label">Client
                <input className="input mt-1 w-full" value={data.client} onChange={e=> setData(d=> ({...d, client:e.target.value}))} />
              </label>
              <label className="label">Project
                <input className="input mt-1 w-full" value={data.projectName} onChange={e=> setData(d=> ({...d, projectName:e.target.value}))} />
              </label>
              <label className="label">General Location
                <input className="input mt-1 w-full" value={data.generalLocation} onChange={e=> setData(d=> ({...d, generalLocation:e.target.value}))} />
              </label>
              <label className="label">Specific Location
                <input className="input mt-1 w-full" value={data.specificLocation} onChange={e=> setData(d=> ({...d, specificLocation:e.target.value}))} />
              </label>
              <label className="label">Mix ID
                <input className="input mt-1 w-full" value={data.mixId} onChange={e=> setData(d=> ({...d, mixId:e.target.value}))} />
              </label>
              <label className="label">Truck No.
                <input className="input mt-1 w-full" value={data.truckNo} onChange={e=> setData(d=> ({...d, truckNo:e.target.value}))} />
              </label>
              <label className="label">Ticket No.
                <input className="input mt-1 w-full" value={data.ticketNo} onChange={e=> setData(d=> ({...d, ticketNo:e.target.value}))} />
              </label>
              <label className="label">Supplier
                <input className="input mt-1 w-full" value={data.supplier} onChange={e=> setData(d=> ({...d, supplier:e.target.value}))} />
              </label>
              <label className="label">Plant
                <input className="input mt-1 w-full" value={data.plant} onChange={e=> setData(d=> ({...d, plant:e.target.value}))} />
              </label>
              <label className="label">Sampled by
                <input className="input mt-1 w-full" value={data.sampledBy} onChange={e=> setData(d=> ({...d, sampledBy:e.target.value}))} />
              </label>
              <label className="label">Sample Time
                <input className="input mt-1 w-full" value={data.sampleTime} onChange={e=> setData(d=> ({...d, sampleTime:e.target.value}))} />
              </label>
              <label className="label">Batch Time
                <input className="input mt-1 w-full" value={data.batchTime} onChange={e=> setData(d=> ({...d, batchTime:e.target.value}))} />
              </label>
              <label className="label">Time Truck Finished Unloading
                <input className="input mt-1 w-full" value={data.timeTruckFinished} onChange={e=> setData(d=> ({...d, timeTruckFinished:e.target.value}))} />
              </label>
              <label className="label">Ambient Temp (°F)
                <input className="input mt-1 w-full" value={data.ambientTempF} onChange={e=> setData(d=> ({...d, ambientTempF:e.target.value}))} />
              </label>
              <label className="label">Yards in load
                <input className="input mt-1 w-full" value={data.yardsInLoad} onChange={e=> setData(d=> ({...d, yardsInLoad:e.target.value}))} />
              </label>
              <label className="label">Cumulative Yards Placed
                <input className="input mt-1 w-full" value={data.cumulativeYardsPlaced} onChange={e=> setData(d=> ({...d, cumulativeYardsPlaced:e.target.value}))} />
              </label>
              <label className="label">Water Added (gals)
                <input className="input mt-1 w-full" value={data.waterAddedGal} onChange={e=> setData(d=> ({...d, waterAddedGal:e.target.value}))} />
              </label>
              <label className="label">Water/Cement Ratio
                <input className="input mt-1 w-full" value={data.waterCementRatio} onChange={e=> setData(d=> ({...d, waterCementRatio:e.target.value}))} />
              </label>
            </div>
          </section>
          <section>
            <div className="section-header">Physical Properties</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
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
                <input className="input mt-1 w-full" value={data.airContentPct} onChange={e=> setData(d=> ({...d, airContentPct:e.target.value}))} />
              </label>
              <label className="label">Air Spec Min (%)
                <input className="input mt-1 w-full" value={data.specAirMin} onChange={e=> setData(d=> ({...d, specAirMin:e.target.value}))} />
              </label>
              <label className="label">Air Spec Max (%)
                <input className="input mt-1 w-full" value={data.specAirMax} onChange={e=> setData(d=> ({...d, specAirMax:e.target.value}))} />
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
              <div className="md:col-span-3 grid md:grid-cols-6 gap-4">
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
                <label className="label">Admix 1 Type
                  <input className="input mt-1 w-full" value={data.admixture1Type} onChange={e=> setData(d=> ({...d, admixture1Type:e.target.value}))} />
                </label>
                <label className="label">Admix 1 (oz)
                  <input className="input mt-1 w-full" value={data.admixture1Oz} onChange={e=> setData(d=> ({...d, admixture1Oz:e.target.value}))} />
                </label>
                <label className="label">Admix 2 Type
                  <input className="input mt-1 w-full" value={data.admixture2Type} onChange={e=> setData(d=> ({...d, admixture2Type:e.target.value}))} />
                </label>
                <label className="label">Admix 2 (oz)
                  <input className="input mt-1 w-full" value={data.admixture2Oz} onChange={e=> setData(d=> ({...d, admixture2Oz:e.target.value}))} />
                </label>
                <label className="label">Admix 3 Type
                  <input className="input mt-1 w-full" value={data.admixture3Type} onChange={e=> setData(d=> ({...d, admixture3Type:e.target.value}))} />
                </label>
                <label className="label">Admix 3 (oz)
                  <input className="input mt-1 w-full" value={data.admixture3Oz} onChange={e=> setData(d=> ({...d, admixture3Oz:e.target.value}))} />
                </label>
                <label className="label">Total Batch Weight (lb)
                  <input className="input mt-1 w-full" value={data.totalBatchWeightLb} onChange={e=> setData(d=> ({...d, totalBatchWeightLb:e.target.value}))} />
                </label>
              </div>
            </div>
          </section>
          <section>
            <div className="section-header">Weather</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
              <label className="label">Weather
                <input className="input mt-1 w-full" value={data.weather} onChange={e=> setData(d=> ({...d, weather:e.target.value}))} />
              </label>
              <label className="label">Est. Wind (mph)
                <input className="input mt-1 w-full" value={data.estWindMph} onChange={e=> setData(d=> ({...d, estWindMph:e.target.value}))} />
              </label>
              <label className="label">Est. RH (%)
                <input className="input mt-1 w-full" value={data.estRhPct} onChange={e=> setData(d=> ({...d, estRhPct:e.target.value}))} />
              </label>
            </div>
          </section>
          <section>
            <div className="section-header">Weather & Equipment</div>
            <div className="p-4 border rounded-b-md grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3 font-semibold text-sm">Equipment identification</div>
              <label className="label">Slump Cone ID
                <input list="slumpConeId-list" className="input mt-1 w-full" value={data.slumpConeId} onChange={e=> setData(d=> ({...d, slumpConeId:e.target.value}))} />
              </label>
              <label className="label">Thermometer ID
                <input list="thermometerId-list" className="input mt-1 w-full" value={data.thermometerId} onChange={e=> setData(d=> ({...d, thermometerId:e.target.value}))} />
              </label>
              <label className="label">Air Meter ID
                <input list="airMeterId-list" className="input mt-1 w-full" value={data.airMeterId} onChange={e=> setData(d=> ({...d, airMeterId:e.target.value}))} />
              </label>
              <label className="label">Unit Weight Measure ID
                <input list="unitWeightMeasureId-list" className="input mt-1 w-full" value={data.unitWeightMeasureId} onChange={e=> setData(d=> ({...d, unitWeightMeasureId:e.target.value}))} />
              </label>
              <label className="label">Scale ID
                <input list="scaleId-list" className="input mt-1 w-full" value={data.scaleId} onChange={e=> setData(d=> ({...d, scaleId:e.target.value}))} />
              </label>
            </div>
          </section>
          <section>
            <div className="section-header">Compressive Strengths</div>
            <div className="p-4 border rounded-b-md space-y-4">
              {data.strengths.map((s,i)=> (
                <div key={i} className="rounded-md border p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white text-sm font-semibold">{s.rowId||String(i+1)}</span>
                      <div className="text-sm text-gray-600">Row details</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn" onClick={()=> setData(d=> ({...d, strengths: d.strengths.filter((_,idx)=> idx!==i)}))}>Remove</button>
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
              <div className="pt-2"><button type="button" className="btn" onClick={()=> setData(d=> ({...d, strengths:[...d.strengths, { rowId:'', ageDays:'', testDate:'', diameterIn1:'', diameterIn2:'', lengthIn1:'', lengthIn2:'', lengthIn3:'', massGm:'', capType:'', totalLoadLbf:'', areaIn2:'', measuredStrengthPsi:'', specified28DayStrengthPsi:'', typeOfFracture:'', personPerformingTest:'', measuredDensityPcf:'' }]}))}>+ Add row</button></div>
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
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <label className="label">Comp. Machine ID
                <input list="compMachineId-list" className="input mt-1 w-full" value={data.compMachineId} onChange={e=> setData(d=> ({...d, compMachineId:e.target.value}))} />
              </label>
              <label className="label">Caliper ID
                <input list="caliperId-list" className="input mt-1 w-full" value={data.caliperId} onChange={e=> setData(d=> ({...d, caliperId:e.target.value}))} />
              </label>
              <label className="label">Scale ID
                <input list="compScaleId-list" className="input mt-1 w-full" value={data.compScaleId} onChange={e=> setData(d=> ({...d, compScaleId:e.target.value}))} />
              </label>
              <label className="label">Ret. Rings
                <input list="retRings-list" className="input mt-1 w-full" value={data.retRings} onChange={e=> setData(d=> ({...d, retRings:e.target.value}))} />
              </label>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
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
                <input className="input mt-1 w-full" value={data.cylindersTempRangeFirst24h} onChange={e=> setData(d=> ({...d, cylindersTempRangeFirst24h:e.target.value}))} />
              </label>
              <label className="label">Cylinders Cured At
                <input className="input mt-1 w-full" value={data.whereCylindersCured} onChange={e=> setData(d=> ({...d, whereCylindersCured:e.target.value}))} />
              </label>
              <label className="label">Field placement observations
                <input className="input mt-1 w-full" value={data.fieldPlacementObservations} onChange={e=> setData(d=> ({...d, fieldPlacementObservations:e.target.value}))} />
              </label>
              <label className="label">Remarks
                <input className="input mt-1 w-full" value={data.remarks} onChange={e=> setData(d=> ({...d, remarks:e.target.value}))} />
              </label>
              <label className="label">Date Received in Lab
                <input type="date" className="input mt-1 w-full" value={data.dateCylindersReceivedInLab} onChange={e=> setData(d=> ({...d, dateCylindersReceivedInLab:e.target.value}))} />
              </label>
              <label className="label">Pick up by
                <input className="input mt-1 w-full" value={data.pickUpBy} onChange={e=> setData(d=> ({...d, pickUpBy:e.target.value}))} />
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
                <input className="input mt-1 w-full" value={data.chargeableTime} onChange={e=> setData(d=> ({...d, chargeableTime:e.target.value}))} />
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
      {/* Datalists for suggestions */}
      {Object.entries(EQUIPMENT_SUGGESTIONS).map(([key, arr]) => (
        <datalist id={`${key}-list`} key={key}>
          {arr.map((v) => (
            <option value={v} key={v} />
          ))}
        </datalist>
      ))}
      <style jsx>{`
        .section-header { background:#3949ab; color:#fff; padding:6px 10px; border-radius:6px 6px 0 0; font-weight:600; letter-spacing:0.02em; }
      `}</style>
    </div>
  );
}
