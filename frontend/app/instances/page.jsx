"use client";
import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { baseUrls } from '../../lib/api';

export default function InstancesList() {
  const { workflow } = baseUrls();
  const [instances, setInstances] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const r = await fetch(`${workflow}/workflow-instances?limit=50`, { cache: 'no-store' });
      const d = await r.json();
      setInstances(Array.isArray(d) ? d : []);
    } catch (e) { setErr(String(e.message||e)); }
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-6">
      <Card title="Instances">
        {instances.length === 0 ? (
          <p className="text-zinc-600">No instances yet. Create one from the Definitions page.</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>State</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {instances.map(i => (
                <tr key={i._id}>
                  <td className="font-mono text-xs">{i._id}</td>
                  <td>{i.currentState}</td>
                  <td>{i.status}</td>
                  <td>{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="text-right"><a className="btn" href={`/instances/${i._id}`}>Open</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>
    </div>
  );
}
