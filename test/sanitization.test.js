const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('Sanitization: Strips malicious script tags from text inputs', () => {
  const dirty = 'Leo <script>alert("hacked")</script> Birthday';
  const clean = app.sanitizeInput(dirty);
  assert.equal(clean, 'Leo  Birthday');
  assert.ok(!clean.includes('<script>'));
});

test('Sanitization: Trims excess whitespace', () => {
  const spaced = '   Sonoma Valley Vineyard   ';
  const clean = app.sanitizeInput(spaced);
  assert.equal(clean, 'Sonoma Valley Vineyard');
});

test('Sanitization: Passes non-string values safely', () => {
  assert.equal(app.sanitizeInput(12345), 12345);
  assert.equal(app.sanitizeInput(null), null);
  assert.equal(app.sanitizeInput(undefined), undefined);
});
