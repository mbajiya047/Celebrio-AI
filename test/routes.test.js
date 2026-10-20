const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('Routes: POST /api/generate-plan rejects oversized event title (> 200 chars)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const longTitle = 'A'.repeat(250);
    const res = await fetch(`http://localhost:${port}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventTitle: longTitle })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('maximum allowed length'));
  } finally {
    server.close();
  }
});

test('Routes: POST /api/generate rejects missing body or non-string prompt', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 12345 })
    });

    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});
