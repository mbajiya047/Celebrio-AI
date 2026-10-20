const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('Security: CORS and Rate Limiter headers exist with Origin', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: { 'Origin': 'http://example.com' }
    });
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('ratelimit-limit'), 'Expected ratelimit-limit header');
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://example.com');
  } finally {
    server.close();
  }
});

test('Security: Static assets do not expose sensitive files', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/.env`);
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});
