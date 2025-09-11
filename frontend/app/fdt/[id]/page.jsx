"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '../../../components/Card';
import { baseUrls } from '../../../lib/api';

export default function FdtReportPage() {
  const { id } = useParams();
  const { workflow } = baseUrls();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${workflow}/fdt/${id}`, { cache: 'no-store' });
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error || r.statusText);
        setData(d);
      } catch (e) { setErr(String(e.message||e)); }
    };
    if (id) load();
  }, [id, workflow]);

  const print = () => window.print();

  return (
    <div className="space-y-6">
      <Card title="" action={<button className="btn" onClick={print}>Print</button>}>
        {err && <p className="text-red-500 mb-3">{err}</p>}
        {!data ? (
          <p className="text-zinc-600">Loading…</p>
        ) : (
          <>
          <div className="bg-white p-6 rounded-md border border-zinc-200 report max-w-5xl mx-auto text-[13px]">
            {/* Title */}
            <div className="text-center mb-2">
              <div className="font-semibold">GEOCAL, INC.</div>
              <div className="font-semibold">FIELD DENSITY OF SOIL / AGGREGATE by Nuclear Method</div>
              <div className="text-sm">ASTM D 6938</div>
            </div>
            {/* Address/Contact row mimic */}
            <div className="text-center text-sm mb-2">
              <div>5709 SE 74th Street, Ste A</div>
              <div>Oklahoma City, OK 73135</div>
              <div>(405) 812-5740</div>
            </div>

            {/* Project / Gauge info */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="col-span-2 border rounded-md p-3">
                <div className="section-subtitle mb-2">Project Information</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-zinc-600">Client:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.client || '-'}</div>
                  </div>
                  <div className="invisible">&nbsp;</div>
                  <div className="col-span-2">
                    <div className="text-xs text-zinc-600">Project Name:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.projectName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600">Project Number:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.projectNo || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600">Date:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.date ? new Date(data.date).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600">Technician:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.testedBy || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600">Weather:</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.weather || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="section-subtitle mb-2">Gauge Information</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">Make:</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span>Troxler:</span>
                      <span className="inline-block w-8 text-center border rounded blue-cell">{data.gaugeMake==='Troxler' ? 'Yes' : ''}</span>
                      <span>Other:</span>
                      <span className="inline-block w-8 text-center border rounded blue-cell">{data.gaugeMake==='Troxler' ? '' : (data.gaugeMake ? 'Yes' : 'No')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-zinc-600">Model:</div>
                      <div className="border rounded-md p-2 min-h-8 blue-cell">{data.gaugeModel || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-600">Serial No.:</div>
                      <div className="border rounded-md p-2 min-h-8 blue-cell">{data.gaugeSN || '-'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-zinc-600">Density Standard Count:</div>
                      <div className="border rounded-md p-2 min-h-8 blue-cell">{data.standardDensityCount ?? '-'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-zinc-600">Moisture Standard Count:</div>
                      <div className="border rounded-md p-2 min-h-8 blue-cell">{data.standardMoistureCount ?? '-'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-zinc-600">Moisture/Density Equations used? (yes/no)</div>
                      <div className="border rounded-md p-2 min-h-8 blue-cell">No</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compaction/Moisture Requirements and General Location */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <div className="text-xs text-zinc-600">Compaction Requirements (%)</div>
                <div className="border rounded-md p-2 min-h-8 blue-cell">{data.minCompactionRequirement ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">Moisture Requirements (+/- %)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-zinc-600">Minus</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.moistureReqFrom ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600">Plus</div>
                    <div className="border rounded-md p-2 min-h-8 blue-cell">{data.moistureReqTo ?? '-'}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">General Location:</div>
                <div className="border rounded-md p-2 min-h-8 blue-cell">{data.generalLocation || '-'}</div>
              </div>
            </div>

            {/* Proctor Information */}
            <div className="section-header mb-2">Proctor Information</div>
            <table className="table w-full mb-4">
              <thead>
                <tr>
                  <th className="text-left">Proctor ID</th>
                  <th className="text-left">Material Description</th>
                  <th className="text-left">Method</th>
                  <th className="text-left">MDD (pcf)</th>
                  <th className="text-left">OMC %</th>
                </tr>
              </thead>
              <tbody>
                {(data.proctors||[]).length === 0 ? (
                  <tr><td colSpan={5} className="text-zinc-600">—</td></tr>
                ) : data.proctors.map((p,i)=> (
                  <tr key={i}>
                    <td>{p.proctorId || '-'}</td>
                    <td>{p.materialDescription || '-'}</td>
                    <td>{p.method || '-'}</td>
                    <td>{p.mddPcf ?? '-'}</td>
                    <td>{p.omcPct ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Test Results */}
            <div className="section-header mb-2">Test Results</div>
            <table className="table w-full mb-2 sheet-table">
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
                {(data.testResults||[]).length === 0 ? (
                  <tr><td colSpan={9} className="text-zinc-600">—</td></tr>
                ) : data.testResults.map((r,i)=> {
                  const loc = (data.locationTests||[])[i] || {};
                  return (
                    <>
                      <tr key={`row-${i}`}>
                        <td className="text-center">{r.testNo ?? '-'}</td>
                        <td className="blue-cell">{r.proctorId || '-'}</td>
                        <td className="blue-cell">{r.probeDepthIn ?? '-'}</td>
                        <td className="blue-cell">{loc.elevLift || '-'}</td>
                        <td className="blue-cell">{r.wetDensityPcf ?? '-'}</td>
                        <td className="blue-cell">{r.dryDensityPcf ?? '-'}</td>
                        <td className="blue-cell">{r.moistureContentPct ?? '-'}</td>
                        <td className="blue-cell">{r.compactionPct ?? '-'}</td>
                        <td className="blue-cell"></td>
                      </tr>
                      <tr key={`lrow-${i}`}>
                        <td className="text-right pr-2">Location:</td>
                        <td colSpan={7} className="blue-cell">{loc.location || '-'}</td>
                        <td className="blue-cell">{loc.material || '' ? `${loc.material}` : ''}</td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>

            {/* Location */}
            <div className="section-header mb-2">Location</div>
            <div className="mb-2"><span className="font-medium">General Location:</span> {data.generalLocation || '-'}</div>
            <table className="table w-full mb-4">
              <thead>
                <tr>
                  <th>Test No.</th>
                  <th>Location</th>
                  <th>Material</th>
                  <th>Elev/Lift of Test</th>
                </tr>
              </thead>
              <tbody>
                {(data.locationTests||[]).length === 0 ? (
                  <tr><td colSpan={4} className="text-zinc-600">—</td></tr>
                ) : data.locationTests.map((l,i)=> (
                  <tr key={i}>
                    <td className="text-center">{l.testNo ?? '-'}</td>
                    <td>{l.location || '-'}</td>
                    <td>{l.material || '-'}</td>
                    <td>{l.elevLift || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

      {/* Legends */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-medium mb-1">Material:</div>
                <div className="text-sm text-zinc-700">1 Base · 2 Subbase · 3 Subgrade · 4 Improved Subgrade · 5 Surface · 6 Fill</div>
              </div>
              <div>
        <div className="font-medium mb-1">Comments:</div>
        <div className="text-sm text-zinc-700">A Test results comply with specifications · B Compaction percentage does not comply · C Retest of previous test · D Moisture in excess · E Moisture below</div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-zinc-600">Full Time Observation / Part Time Observation</div>
                <div className="mt-1">{data.observationType || '-'}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-600">Field Representative</div>
                  <div className="border rounded-md h-12"/>
                  <div className="text-xs text-zinc-500 mt-1">{data.fieldRepresentative || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">Reviewed by:</div>
                  <div className="border rounded-md h-12"/>
                  <div className="text-xs text-zinc-500 mt-1">{data.reviewedBy || '-'}</div>
                </div>
              </div>
            </div>
    </div>
          <style jsx>{`
            .section-header{ background:#43a047; color:#fff; padding:6px 10px; border-radius:6px; font-weight:600; letter-spacing:0.02em; }
            .section-subtitle { background:#e8f5e9; border:1px solid #b2dfdb; padding:4px 8px; border-radius:6px; font-weight:600; }
            .sheet-table th, .sheet-table td { border: 1px solid rgba(0,0,0,0.35); }
            .blue-cell { background: #d8f2f2; }
            @media print {
              .btn { display:none; }
              header, nav { display:none; }
              .card, .Card { box-shadow:none; border:0 }
              .report { width: 8.27in; } /* A4 portrait width */
            }
          `}</style>
    </>
  )}
      </Card>
    </div>
  );
}
