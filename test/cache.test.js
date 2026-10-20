const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('Cache: Generates consistent SHA-256 keys', () => {
  const data1 = { type: 'wedding', budget: 30000 };
  const data2 = { type: 'wedding', budget: 30000 };
  const data3 = { type: 'birthday', budget: 5000 };

  const key1 = app.getCacheKey('plan', data1);
  const key2 = app.getCacheKey('plan', data2);
  const key3 = app.getCacheKey('plan', data3);

  assert.equal(key1, key2);
  assert.notEqual(key1, key3);
});

test('Cache: Sets and gets cached value before TTL', () => {
  const key = 'test:key:1';
  const val = { result: 'Cached celebration plan' };

  app.setInCache(key, val);
  const retrieved = app.getFromCache(key);

  assert.deepEqual(retrieved, val);
});

test('Cache: Returns null for non-existent key', () => {
  const result = app.getFromCache('non_existent_key_xyz');
  assert.equal(result, null);
});
