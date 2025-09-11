"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
  const authBase = gateway.replace(':4000', ':5001');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${authBase}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'login_failed'); return; }
      localStorage.setItem('accessToken', data.accessToken);
      setToken(data.accessToken);
    } catch (err) { setError(err.message); }
  }

  return <main className="space-y-6">
    <section className="card p-4 max-w-md">
      <h1 className="text-xl font-semibold mb-3">Login</h1>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
        <button className="btn" type="submit">Login</button>
      </form>
      {error && <p className="text-red-400 mt-2">{error}</p>}
      {token && <p className="text-xs break-words mt-2">Token: {token}</p>}
    </section>
  </main>;
}
