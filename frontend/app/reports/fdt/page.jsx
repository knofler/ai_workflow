export default async function FdtReports() {
  const base = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const workflow = base.replace(':4000', ':5002');
  const items = await fetch(`${workflow}/fdt`, { cache: 'no-store' }).then(r=> r.json());
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">FDT Reports</h1>
      <div className="card p-4">
        <table className="table">
          <thead><tr><th>Date</th><th>Client</th><th>Project</th><th></th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.date ? new Date(it.date).toLocaleDateString() : ''}</td>
                <td>{it.client}</td>
                <td>{it.projectNo} — {it.projectName}</td>
                <td className="text-right"><a className="btn" href={`/fdt/${it._id}`}>Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
