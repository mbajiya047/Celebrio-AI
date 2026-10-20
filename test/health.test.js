const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('GET /api/health returns 200 and system status', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(res.status, 200);

    // Verify Helmet Security Headers
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(res.headers.get('content-security-policy'), 'Missing Content-Security-Policy');

    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(typeof data.hasApiKey, 'boolean');
    assert.equal(typeof data.uptimeSeconds, 'number');
  } finally {
    server.close();
  }
});
