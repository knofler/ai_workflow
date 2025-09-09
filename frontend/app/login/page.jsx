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

  return <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
    <h1>Login</h1>
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 300 }}>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button type="submit">Login</button>
    </form>
    {error && <p style={{ color: 'red' }}>{error}</p>}
    {token && <p style={{ wordBreak: 'break-all' }}>Token: {token}</p>}
  </main>;
}
