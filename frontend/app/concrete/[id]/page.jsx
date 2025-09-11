export default async function ConcreteReport({ params }) {
  const base = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const workflow = base.replace(':4000', ':5002');
  const doc = await fetch(`${workflow}/concrete/${params.id}`, { cache: 'no-store' }).then(r=> r.json());
  return (
    <div className="max-w-3xl mx-auto p-6 text-[13px]">
      <h1 className="text-xl font-semibold mb-4">Concrete Field Report</h1>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>Client: <b>{doc.client}</b></div>
        <div>Date: <b>{doc.date ? new Date(doc.date).toLocaleDateString() : ''}</b></div>
        <div>Project: <b>{doc.projectNo} — {doc.projectName}</b></div>
        <div>Weather: <b>{doc.weather}</b></div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Delivery / Mix</div>
        <div className="grid grid-cols-3 gap-2">
          <div>Supplier: <b>{doc.supplier}</b></div>
          <div>Truck: <b>{doc.truckNo}</b></div>
          <div>Ticket: <b>{doc.ticketNo}</b></div>
          <div>Mix Design: <b>{doc.mixDesign}</b></div>
          <div>Placement: <b>{doc.placementLocation}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Fresh Properties</div>
        <div className="grid grid-cols-3 gap-2">
          <div>Slump (in): <b>{doc.slumpIn}</b></div>
          <div>Air Content (%): <b>{doc.airContentPct}</b></div>
          <div>Unit Weight (pcf): <b>{doc.unitWeightPcf}</b></div>
          <div>Concrete Temp (F): <b>{doc.tempConcreteF}</b></div>
          <div>Ambient Temp (F): <b>{doc.ambientTempF}</b></div>
          <div>Water Added (gal): <b>{doc.waterAddedGal}</b></div>
          <div>Admixtures: <b>{doc.admixtures}</b></div>
        </div>
      </div>
      <div className="border rounded p-3 mb-4">
        <div className="font-medium mb-2">Cylinders Cast</div>
        <table className="table w-full">
          <thead><tr><th>Qty</th><th>Size (in)</th><th>Age (days)</th><th>IDs</th></tr></thead>
          <tbody>
            {(doc.cylinders||[]).map((c,i)=> (
              <tr key={i}><td>{c.qty}</td><td>{c.sizeIn}</td><td>{c.ageDays}</td><td>{c.ids}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>Tested By: <b>{doc.testedBy}</b></div>
        <div>Field Rep: <b>{doc.fieldRepresentative}</b></div>
      </div>
      <div className="text-sm text-zinc-700">Notes: {doc.notes}</div>
  <div className="mt-4"><a className="btn" href="#" onClick={(e)=>{e.preventDefault(); if (typeof window!== 'undefined') window.print();}}>Print</a></div>
    </div>
  );
}
