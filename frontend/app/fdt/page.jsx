"use client";
import { useState } from 'react';
import Card from '../../components/Card';
import { baseUrls, jsonFetch } from '../../lib/api';

const MATERIAL_OPTIONS = [
  { code: '1', label: 'Base' },
  { code: '2', label: 'Subbase' },
  { code: '3', label: 'Subgrade' },
  { code: '4', label: 'Improved Subgrade' },
  { code: '5', label: 'Surface' },
  { code: '6', label: 'Fill' }
];
const RESULT_OPTIONS = [
  { code: 'A', label: 'Test results comply with specifications' },
  { code: 'B', label: 'Compaction percentage does not comply with specifications' },
  { code: 'C', label: 'Retest of previous test' },
  { code: 'D', label: 'Moisture in excess of specifications' },
  { code: 'E', label: 'Moisture below specifications' }
];

export default function FdtFormPage() {
  const { workflow } = baseUrls();
  const [header, setHeader] = useState({
    client: '',
    date: new Date().toISOString().slice(0,10),
    projectNo: '',
    projectName: '',
    weather: ''
  });
  const [testing, setTesting] = useState({
    testedBy: '',
    testMode: 'Direct Transmission',
    dateTested: new Date().toISOString().slice(0,10),
    standardDensityCount: '',
    standardMoistureCount: '',
    testMethod: '',
    gaugeMake: 'Troxler',
    gaugeModel: '3430',
    gaugeSN: '',
    minCompactionRequirement: '',
    moistureReqFrom: '',
    moistureReqTo: '',
    equationsUsed: 'No' // Yes | No (display only; backend ignores)
  });
  const [proctors, setProctors] = useState([{ proctorId:'', materialDescription:'', method:'', mddPcf:'', omcPct:'' }]);
  const [testResults, setTestResults] = useState(
    Array.from({ length: 2 }, (_,i)=>({ testNo: i+1, proctorId:'', probeDepthIn:'', wetDensityPcf:'', dryDensityPcf:'', moistureContentPct:'', compactionPct:'', resultCode:'' }))
  );
  const [location, setLocation] = useState({ generalLocation: '' });
  const [locationTests, setLocationTests] = useState(Array.from({ length: 2 }, (_,i)=>({ testNo: i+1, location:'', material:'', elevLift:'' })));
  const [observationType, setObservationType] = useState('Part Time');
  const [fieldRepresentative, setFieldRepresentative] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [notes, setNotes] = useState('');

  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  // derive map for quick lookups
  const proctorMap = Object.fromEntries(proctors.filter(p=>p.proctorId).map(p=> [p.proctorId, p]));
  const calcCompaction = (dry, proctorId) => {
    const p = proctorMap[proctorId];
    if (!p?.mddPcf || !dry) return '';
    const v = (Number(dry)/Number(p.mddPcf))*100;
    return (Math.round(v*10)/10).toString();
  };
  const calcResult = (moisturePct, compactionPct, proctorId) => {
    const p = proctorMap[proctorId];
    if (!p) return '';
    const omc = Number(p.omcPct||0);
    const minus = Number(testing.moistureReqFrom||0);
    const plus = Number(testing.moistureReqTo||0);
    const minComp = Number(testing.minCompactionRequirement||0);
    const mc = Number(moisturePct||0);
    const comp = Number(compactionPct||0);
    if (comp && comp < minComp) return 'B';
    if (mc > omc + plus) return 'D';
    if (mc < omc - minus) return 'E';
    return comp ? 'A' : '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = {
        ...header,
        ...testing,
        proctors: proctors.filter(p=>p.proctorId || p.materialDescription || p.method || p.mddPcf || p.omcPct),
        testResults: testResults.filter(r=>r.probeDepthIn || r.wetDensityPcf || r.dryDensityPcf || r.moistureContentPct || r.compactionPct),
        generalLocation: location.generalLocation,
        locationTests: locationTests.filter(r=>r.location || r.material || r.elevLift),
        observationType,
        fieldRepresentative,
        reviewedBy,
        notes
      };
      const r = await jsonFetch(`${workflow}/fdt`, { method: 'POST', body: JSON.stringify(payload) });
      setResult(r);
    } catch (e) { setErr(String(e.message||e)); }
  };

  const onChangeTest = (i, patch) => {
    setTestResults(prev => {
      const next = prev.map((x,idx)=> idx===i? { ...x, ...patch } : x);
      const r = next[i];
      const comp = calcCompaction(r.dryDensityPcf, r.proctorId);
      const res = calcResult(r.moistureContentPct, comp||r.compactionPct, r.proctorId);
      next[i] = { ...r, compactionPct: comp || r.compactionPct, resultCode: res || r.resultCode };
      return next;
    });
  };

  const renumber = (arr) => arr.map((r, idx) => ({ ...r, testNo: idx + 1 }));
  const addTestRow = () => {
    if (testResults.length >= 30) return;
    setTestResults(prev => {
      const last = prev[prev.length-1] || {};
      return renumber([...prev, { testNo: prev.length + 1, proctorId:last.proctorId||'', probeDepthIn:last.probeDepthIn||'', wetDensityPcf:'', dryDensityPcf:'', moistureContentPct:'', compactionPct:'', resultCode:'' }]);
    });
    setLocationTests(prev => {
      const last = prev[prev.length-1] || {};
      return renumber([...prev, { testNo: prev.length + 1, location:last.location||'', material:last.material||'', elevLift:last.elevLift||'' }]);
    });
  };
  const removeTestRow = (i) => {
    setTestResults(prev => renumber(prev.filter((_, idx) => idx !== i)));
    setLocationTests(prev => renumber(prev.filter((_, idx) => idx !== i)));
  };

  // guards: minimal required fields
  const canSubmit = () => {
    if (!header.date || !header.projectNo || !header.projectName) return false;
    if (!testing.testedBy || !testing.gaugeModel) return false;
    if (!proctors.length) return false;
    const anyRow = testResults.some(r=> r.proctorId && (r.dryDensityPcf || r.moistureContentPct));
    return anyRow;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto overflow-x-hidden text-[13px]">
      <Card title="" action={<button className="btn" onClick={submit} disabled={!canSubmit()}>Submit</button>}>
        <form className="space-y-6" onSubmit={submit}>
          {/* Title */}
          <div className="text-center">
            <div className="font-semibold">GEOCAL, INC.</div>
            <div className="font-semibold">FIELD DENSITY OF SOIL / AGGREGATE by Nuclear Method</div>
            <div className="text-sm">ASTM D 6938</div>
          </div>

          {/* Project / Gauge Information */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 border rounded-md p-3">
                <div className="section-subtitle mb-2">Project Information</div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="label">Client:
                    <input className="input mt-1 w-full blue-cell" value={header.client} onChange={e=>setHeader(h=>({...h, client:e.target.value}))} />
                  </label>
                  <div className="label">&nbsp;</div>
                  <label className="label col-span-2">Project Name:
                    <input className="input mt-1 w-full blue-cell" value={header.projectName} onChange={e=>setHeader(h=>({...h, projectName:e.target.value}))} />
                  </label>
                  <label className="label">Project Number:
                    <input className="input mt-1 w-full blue-cell" value={header.projectNo} onChange={e=>setHeader(h=>({...h, projectNo:e.target.value}))} />
                  </label>
                  <label className="label">Date:
                    <input type="date" className="input mt-1 w-full blue-cell" value={header.date} onChange={e=>setHeader(h=>({...h, date:e.target.value}))} />
                  </label>
                  <label className="label">Technician:
                    <input className="input mt-1 w-full blue-cell" value={testing.testedBy} onChange={e=>setTesting(t=>({...t, testedBy:e.target.value}))} />
                  </label>
                  <label className="label">Weather:
                    <input className="input mt-1 w-full blue-cell" value={header.weather} onChange={e=>setHeader(h=>({...h, weather:e.target.value}))} />
                  </label>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="section-subtitle mb-2">Gauge Information</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="label">Make:</div>
                    <div className="flex items-center gap-3">
                      <span>Troxler:</span>
                      <label className="inline-flex items-center gap-1"><input type="radio" name="make" checked={testing.gaugeMake==='Troxler'} onChange={()=> setTesting(t=>({...t, gaugeMake:'Troxler'}))}/> Yes</label>
                      <span>Other:</span>
                      <label className="inline-flex items-center gap-1"><input type="radio" name="make" checked={testing.gaugeMake==='Other'} onChange={()=> setTesting(t=>({...t, gaugeMake:'Other'}))}/> No</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="label">Model:
                      <input className="input mt-1 w-full blue-cell" value={testing.gaugeModel} onChange={e=>setTesting(t=>({...t, gaugeModel:e.target.value}))} />
                    </label>
                    <label className="label">Serial No.:
                      <input className="input mt-1 w-full blue-cell" value={testing.gaugeSN} onChange={e=>setTesting(t=>({...t, gaugeSN:e.target.value}))} />
                    </label>
                    <label className="label col-span-2">Density Standard Count:
                      <input className="input mt-1 w-full blue-cell" value={testing.standardDensityCount} onChange={e=>setTesting(t=>({...t, standardDensityCount:e.target.value}))} />
                    </label>
                    <label className="label col-span-2">Moisture Standard Count:
                      <input className="input mt-1 w-full blue-cell" value={testing.standardMoistureCount} onChange={e=>setTesting(t=>({...t, standardMoistureCount:e.target.value}))} />
                    </label>
                    <label className="label col-span-2">Moisture/Density Equations used? (yes/no)
                      <div className="mt-1 flex gap-6">
                        <label className="inline-flex items-center gap-2"><input type="radio" name="eq" checked={testing.equationsUsed==='Yes'} onChange={()=> setTesting(t=>({...t, equationsUsed:'Yes'}))}/> Yes</label>
                        <label className="inline-flex items-center gap-2"><input type="radio" name="eq" checked={testing.equationsUsed==='No'} onChange={()=> setTesting(t=>({...t, equationsUsed:'No'}))}/> No</label>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Compaction / Moisture Requirements */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="label">Compaction Requirements (%)
                <input className="input mt-1 w-full" value={testing.minCompactionRequirement} onChange={e=>setTesting(t=>({...t, minCompactionRequirement:e.target.value}))} />
              </label>
              <div>
                <div className="label">Moisture Requirements (+/- %)</div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <label className="label">Minus
                    <input className="input mt-1 w-full" value={testing.moistureReqFrom} onChange={e=>setTesting(t=>({...t, moistureReqFrom:e.target.value}))} />
                  </label>
                  <label className="label">Plus
                    <input className="input mt-1 w-full" value={testing.moistureReqTo} onChange={e=>setTesting(t=>({...t, moistureReqTo:e.target.value}))} />
                  </label>
                </div>
              </div>
              <div>
                <div className="label">General Location:</div>
                <input className="input mt-1 w-full" value={location.generalLocation} onChange={e=> setLocation(prev=> ({...prev, generalLocation: e.target.value}))} />
              </div>
            </div>
          </section>

          {/* Proctor Information */}
          <section>
            <div className="section-header">Proctor Information</div>
            <div className="p-4 border border-zinc-200 rounded-b-md">
              <table className="table w-full sheet-table">
                <thead>
                  <tr>
                    <th className="text-left">Proctor ID</th>
                    <th className="text-left">Material Description</th>
                    <th className="text-left">Proctor Test Method</th>
                    <th className="text-left">Max Dry Density, (pcf)</th>
                    <th className="text-left">Optimum Moisture %</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {proctors.map((p,i)=> (
                    <tr key={i}>
                      <td><input className="input w-full blue-cell" value={p.proctorId} onChange={e=> setProctors(prev=> prev.map((x,idx)=> idx===i?{...x, proctorId:e.target.value}:x))} /></td>
                      <td><input className="input w-full blue-cell" value={p.materialDescription} onChange={e=> setProctors(prev=> prev.map((x,idx)=> idx===i?{...x, materialDescription:e.target.value}:x))} /></td>
                      <td><input className="input w-full blue-cell" value={p.method} onChange={e=> setProctors(prev=> prev.map((x,idx)=> idx===i?{...x, method:e.target.value}:x))} /></td>
                      <td><input className="input w-full blue-cell" value={p.mddPcf} onChange={e=> setProctors(prev=> prev.map((x,idx)=> idx===i?{...x, mddPcf:e.target.value}:x))} /></td>
                      <td><input className="input w-full blue-cell" value={p.omcPct} onChange={e=> setProctors(prev=> prev.map((x,idx)=> idx===i?{...x, omcPct:e.target.value}:x))} /></td>
                      <td className="text-right"><button type="button" className="btn" onClick={()=> setProctors(prev=> prev.length>1 ? prev.filter((_,idx)=> idx!==i) : prev)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2"><button type="button" className="btn" onClick={()=> setProctors(prev=> [...prev, { proctorId:'', materialDescription:'', method:'', mddPcf:'', omcPct:'' }])}>+ Add row</button></div>
            </div>
          </section>

          {/* Test Results (30 rows) */}
          <section>
            <div className="section-header">Test Results</div>
            <div className="p-4 border border-zinc-200 rounded-b-md">
              <table className="table w-full sheet-table text-[12px]">
                <thead>
                  <tr>
                    <th>Test No.</th>
                    <th>Proctor ID</th>
                    <th>Test Depth (in)</th>
                    <th>Elev/Lift of Test</th>
                    <th>Wet Density (pcf)</th>
                    <th>Dry Density, (pcf)</th>
                    <th>Moisture Content %</th>
                    <th>Percent Compaction</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((r,i)=> (
                    <>
                      <tr key={`row-${i}`}>
                        <td className="text-center">{r.testNo}</td>
                        <td><input className="input w-full blue-cell" value={r.proctorId} onChange={e=> onChangeTest(i, { proctorId:e.target.value })} /></td>
                        <td><input className="input w-full blue-cell" value={r.probeDepthIn} onChange={e=> onChangeTest(i, { probeDepthIn:e.target.value })} /></td>
                        <td><input className="input w-full blue-cell" value={locationTests[i]?.elevLift || ''} onChange={e=> setLocationTests(prev=> prev.map((x,idx)=> idx===i?{...x, elevLift:e.target.value}:x))} /></td>
                        <td><input className="input w-full blue-cell" value={r.wetDensityPcf} onChange={e=> onChangeTest(i, { wetDensityPcf:e.target.value })} /></td>
                        <td><input className="input w-full blue-cell" value={r.dryDensityPcf} onChange={e=> onChangeTest(i, { dryDensityPcf:e.target.value })} /></td>
                        <td><input className="input w-full blue-cell" value={r.moistureContentPct} onChange={e=> onChangeTest(i, { moistureContentPct:e.target.value })} /></td>
                        <td><input className="input w-full blue-cell" value={r.compactionPct} onChange={e=> onChangeTest(i, { compactionPct:e.target.value })} /></td>
                        <td className="blue-cell text-right">
                          <button type="button" className="btn" onClick={()=> removeTestRow(i)}>Remove</button>
                        </td>
                      </tr>
                      <tr key={`lrow-${i}`}>
                        <td className="text-right pr-2">Location:</td>
                        <td colSpan={7}><input className="input w-full" value={locationTests[i]?.location || ''} onChange={e=> setLocationTests(prev=> prev.map((x,idx)=> idx===i?{...x, location:e.target.value}:x))} /></td>
                        <td>
                          <select className="input w-full" value={locationTests[i]?.material || ''} onChange={e=> setLocationTests(prev=> prev.map((x,idx)=> idx===i?{...x, material:e.target.value}:x))}>
                            <option value="">Material</option>
                            {MATERIAL_OPTIONS.map(m=> <option key={m.code} value={`${m.code}`}>{m.code} — {m.label}</option>)}
                          </select>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-zinc-600">Rows: {testResults.length} / 30</div>
                <button type="button" className="btn" onClick={addTestRow} disabled={testResults.length>=30}>+ Add row</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="label">Material:</div>
                  <ul className="list-disc pl-5 text-sm text-zinc-700">
                    {MATERIAL_OPTIONS.map(m=> (<li key={m.code}><span className="font-medium">{m.code}</span> {m.label}</li>))}
                  </ul>
                </div>
                <div>
                  <div className="label">Comments:</div>
                  <ul className="list-disc pl-5 text-sm text-zinc-700">
                    {RESULT_OPTIONS.map(r=> (<li key={r.code}><span className="font-medium">{r.code}</span> {r.label}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Remarks and Observation */}
          <section>
            <label className="label">Remarks:
              <textarea className="input mt-1 w-full h-24" value={notes} onChange={e=> setNotes(e.target.value)} />
            </label>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={observationType==='Full Time'} onChange={() => setObservationType(observationType==='Full Time' ? 'Part Time' : 'Full Time')} /> Full Time Observation</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={observationType==='Part Time'} onChange={() => setObservationType(observationType==='Part Time' ? 'Full Time' : 'Part Time')} /> Part Time Observation</label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="label">Field Representative
                  <input className="input mt-1 w-full" value={fieldRepresentative} onChange={e=> setFieldRepresentative(e.target.value)} />
                </label>
                <label className="label">Reviewed by:
                  <input className="input mt-1 w-full" value={reviewedBy} onChange={e=> setReviewedBy(e.target.value)} />
                </label>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">The information presented in this report is preliminary in nature and presented for informational purposes only. The information included herein is not to be used for acceptance, compliance, or contractual purposes. This information is subject to review and change. These test results apply only to the specific locations noted and may not represent any other locations or elevations. Reports may not be reproduced, except in full, without written permission Geocal, Inc.</p>
          </section>

          {/* Observation & Sign-offs */}
          <section>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="label">Observation</div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="obs" checked={observationType==='Full Time'} onChange={()=> setObservationType('Full Time')} /> Full Time Observation</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="obs" checked={observationType==='Part Time'} onChange={()=> setObservationType('Part Time')} /> Part Time Observation</label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="label">Field Representative
                  <input className="input mt-1 w-full" value={fieldRepresentative} onChange={e=> setFieldRepresentative(e.target.value)} />
                </label>
                <label className="label">Reviewed by:
                  <input className="input mt-1 w-full" value={reviewedBy} onChange={e=> setReviewedBy(e.target.value)} />
                </label>
              </div>
            </div>
            <label className="label mt-4 block">Notes
              <textarea className="input mt-1 w-full h-24" value={notes} onChange={e=> setNotes(e.target.value)} />
            </label>
          </section>
        </form>
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>

      {result && (
        <Card title="Submitted">
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          <a className="btn mt-3 inline-block" href={`/fdt/${result._id}`}>Open Report</a>
        </Card>
      )}
      <style jsx>{`
        .section-header { background:#43a047; color:#fff; padding:6px 10px; border-radius:6px 6px 0 0; font-weight:600; letter-spacing:0.02em; }
        .section-subtitle { background:#e8f5e9; border:1px solid #b2dfdb; padding:4px 8px; border-radius:6px; font-weight:600; }
        .sheet-table th, .sheet-table td { border: 1px solid rgba(0,0,0,0.35); }
        .blue-cell { background: #d8f2f2; }
        @media print { .btn { display:none; } header, nav { display:none; } .card, .Card { box-shadow:none; border:0 } }
      `}</style>
    </div>
  );
}
