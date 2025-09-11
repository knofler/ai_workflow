export default async function ConcreteReports() {
  // Prefer explicit WORKFLOW URL for Vercel; else use internal URL in Docker; else localhost dev
  const workflow = process.env.NEXT_PUBLIC_WORKFLOW_URL
    || process.env.WORKFLOW_INTERNAL_URL
    || (process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000').replace(':4000', ':5002');
  let items = [];
  try {
    const res = await fetch(`${workflow}/concrete`, { cache: 'no-store' });
    items = await res.json();
  } catch (e) {
    console.error('Failed to load concrete reports:', e);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Concrete Reports</h1>
      <div className="card p-4">
        {items?.error && (
          <div className="text-red-600 mb-3">Error: {String(items.error)}</div>
        )}
        <table className="table">
          <thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Ticket</th><th></th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.date ? new Date(it.date).toLocaleDateString() : ''}</td>
                <td>{it.client}</td>
                <td>{it.projectNo} — {it.projectName}</td>
                <td>{it.ticketNo}</td>
                <td className="text-right"><a className="btn" href={`/concrete/${it._id}`}>Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
