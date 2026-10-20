const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('Parser: Extracts clean JSON directly', () => {
  const input = '{"title":"Celebration Gala","budget":10000}';
  const parsed = app.cleanAndParseJSON(input);
  assert.equal(parsed.title, 'Celebration Gala');
  assert.equal(parsed.budget, 10000);
});

test('Parser: Extracts JSON from markdown code fence', () => {
  const input = 'Here is the plan:\n```json\n{"theme":"Retro Neon","guests":50}\n```\nEnjoy!';
  const parsed = app.cleanAndParseJSON(input);
  assert.equal(parsed.theme, 'Retro Neon');
  assert.equal(parsed.guests, 50);
});

test('Parser: Extracts JSON from conversational text with surrounding braces', () => {
  const input = 'Sure! Here is the output: {"conceptName":"Tuscan Wine","colors":["#C86D51"]} Have a great event!';
  const parsed = app.cleanAndParseJSON(input);
  assert.equal(parsed.conceptName, 'Tuscan Wine');
  assert.equal(parsed.colors[0], '#C86D51');
});

test('Parser: Throws error on unparseable string', () => {
  const input = 'Sorry, I cannot generate an event plan right now.';
  assert.throws(() => {
    app.cleanAndParseJSON(input);
  }, /Malformed JSON/);
});
