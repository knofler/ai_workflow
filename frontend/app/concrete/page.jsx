"use client";
import { useMemo, useState } from 'react';
import Card from '../../components/Card';
import { baseUrls, jsonFetch } from '../../lib/api';
import { EQUIPMENT_DEFAULTS, EQUIPMENT_SUGGESTIONS, SPEC_DEFAULTS } from '../../lib/concreteDefaults';
import StepReference from '../../components/concrete/StepReference';
import StepPhysical from '../../components/concrete/StepPhysical';
import StepWeatherEquipment from '../../components/concrete/StepWeatherEquipment';
import StepStrengths from '../../components/concrete/StepStrengths';
import StepCylinders from '../../components/concrete/StepCylinders';
import StepLogistics from '../../components/concrete/StepLogistics';

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
  maxAggregateSizeIn: EQUIPMENT_DEFAULTS.maxAggregateSizeIn, totalBatchWeightLb:'',
  admixtures: [{ type:'', oz:'' }],
    // Equipment IDs
  slumpConeId: EQUIPMENT_DEFAULTS.slumpConeId,
  thermometerId: EQUIPMENT_DEFAULTS.thermometerId,
  airMeterId: EQUIPMENT_DEFAULTS.airMeterId,
  unitWeightMeasureId: EQUIPMENT_DEFAULTS.unitWeightMeasureId,
  scaleId: EQUIPMENT_DEFAULTS.scaleId,
    // Cylinders list
    cylinders:[{ qty:'', sizeIn:'6', ageDays:'7', ids:'' }],
    // Strengths start with a single card
  strengths:[{ rowId:'A', ageDays:'', testDate:'', diameterIn1:'', diameterIn2:'', lengthIn1:'', lengthIn2:'', lengthIn3:'', massGm:'', capType:'', totalLoadLbf:'', areaIn2:'', measuredStrengthPsi:'', specified28DayStrengthPsi:'', typeOfFracture:'', personPerformingTest:'', measuredDensityPcf:'' }],
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
  const [step, setStep] = useState(0);
  const steps = useMemo(()=>[
    { key:'ref', title:'Reference Data', Component: StepReference },
    { key:'phys', title:'Physical Properties', Component: StepPhysical },
    { key:'we', title:'Weather & Equipment', Component: StepWeatherEquipment },
    { key:'str', title:'Compressive Strengths', Component: StepStrengths },
    { key:'cyl', title:'Cylinders Cast', Component: StepCylinders },
    { key:'log', title:'Logistics & Notes', Component: StepLogistics },
  ], []);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setErr('');
    try {
      // Map dynamic admixtures array to legacy fields (admixture1/2/3)
      const admixtures = data.admixtures || [];
      const [a1, a2, a3] = [admixtures[0], admixtures[1], admixtures[2]];
      const ticketNo = data.ticketNo && String(data.ticketNo).trim().length ? data.ticketNo : `T-${Date.now().toString().slice(-8)}`;
      const payload = {
        ...data,
        ticketNo,
        admixture1Type: a1?.type || '',
        admixture1Oz: a1?.oz || '',
        admixture2Type: a2?.type || '',
        admixture2Oz: a2?.oz || '',
        admixture3Type: a3?.type || '',
        admixture3Oz: a3?.oz || '',
      };
      const r = await jsonFetch(`${workflow}/concrete`, { method:'POST', body: JSON.stringify(payload) });
      setResult(r);
    } catch (e) { setErr(String(e.message||e)); }
  };

  const StepBody = steps[step]?.Component;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card title="Report of Field Inspection of Concrete – Single Mix">
        <div className="space-y-4">
          {/* Top stepper with labeled tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Form steps">
            {steps.map((s,i)=> {
              const isCurrent = i===step;
              const isDone = i < step;
              return (
                <button
                  key={s.key}
                  role="tab"
                  aria-selected={isCurrent}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${isCurrent ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  onClick={()=> setStep(i)}
                >
                  <span className="font-medium mr-1">{isDone ? '✓' : i+1}.</span> {s.title}
                </button>
              );
            })}
          </div>

          <h3 className="text-base font-semibold text-gray-800">{steps[step].title}</h3>
          <div className="p-4 border rounded-md">
            {StepBody && <StepBody data={data} setData={setData} />}
          </div>

          {/* Spacer to avoid overlap when sticky footer is active */}
          <div className="h-2" />
        </div>
        {err && <p className="text-red-400 mt-3">{err}</p>}

        {/* In-card sticky footer for navigation + submit */}
        <div className="-mx-4 sticky bottom-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t px-4 py-3 flex items-center justify-between">
          <button className="btn" disabled={step===0} onClick={()=> setStep(s=> Math.max(0, s-1))}>Back</button>
          <div className="text-sm text-gray-600">Step {step+1} of {steps.length}</div>
          {step < steps.length-1 ? (
            <button className="btn" onClick={()=> setStep(s=> Math.min(steps.length-1, s+1))}>Next</button>
          ) : (
            <button className="btn" onClick={submit}>Submit</button>
          )}
        </div>
      </Card>

      {result && (
        <Card title="Submitted">
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          <a className="btn mt-3 inline-block" href={`/concrete/${result._id}`}>Open Report</a>
        </Card>
      )}
      {/* Removed floating submit; footer inside the card */}
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
