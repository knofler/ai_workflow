// Simple integration flow using fetch (Node 20 has global fetch)
// Prereq: docker compose stack running locally.
const base = {
  auth: 'http://localhost:5001',
  gateway: 'http://localhost:4000',
  workflow: 'http://localhost:5002',
  notify: 'http://localhost:5003'
};

function log(step, data) { console.log(`STEP ${step}:`, data); }

async function main() {
  // Login admin
  const loginRes = await fetch(base.auth + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'admin123' }) }).then(r => r.json());
  if (!loginRes.accessToken) throw new Error('Login failed');
  log('login', loginRes);
  const token = loginRes.accessToken;

  // Create workflow definition
  const defRes = await fetch(base.workflow + '/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'TestFlow', states: ['start','next','end'], transitions: { start: { go: 'next' }, next: { finish: 'end' } } }) }).then(r => r.json());
  if (defRes.error) throw new Error('Create def failed ' + defRes.error);
  log('create_def', defRes._id || defRes.id);

  // Start instance
  const instRes = await fetch(base.workflow + '/workflow-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ definitionId: defRes._id || defRes.id }) }).then(r => r.json());
  if (instRes.error) throw new Error('Start instance failed ' + instRes.error);
  log('start_instance', instRes._id || instRes.id);

  // Advance event
  const evt1 = await fetch(base.workflow + `/workflow-instances/${instRes._id || instRes.id}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'go' }) }).then(r => r.json());
  if (evt1.error) throw new Error('Event1 failed ' + evt1.error);
  log('event1', evt1.currentState);

  console.log('INTEGRATION OK');
}

main().catch(e => { console.error('INTEGRATION FAILED', e); process.exit(1); });
