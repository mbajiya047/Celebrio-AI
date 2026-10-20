const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Sample Data: Validates integrity of all 3 showcase event plans', () => {
  const filePath = path.join(__dirname, '../public/js/sample-data.js');
  const code = fs.readFileSync(filePath, 'utf8');

  // Safely evaluate SAMPLE_EVENTS
  const fn = new Function(`${code}; return SAMPLE_EVENTS;`);
  const sampleEvents = fn();

  assert.equal(sampleEvents.length, 3, 'Expected 3 pre-loaded showcase events');

  sampleEvents.forEach(evt => {
    // Validate Summary
    assert.ok(evt.summary.title, 'Event missing title');
    assert.ok(evt.summary.eventType, 'Event missing type');
    assert.ok(evt.summary.guestCount > 0, 'Invalid guest count');
    assert.ok(evt.summary.budgetTotal > 0, 'Invalid budget total');

    // Validate Theme & Palette
    assert.ok(evt.theme.colorPalette.length >= 3, 'Palette should have at least 3 colors');
    evt.theme.colorPalette.forEach(c => {
      assert.match(c.hex, /^#[0-9A-Fa-f]{6}$/, `Invalid hex color: ${c.hex}`);
    });

    // Validate Budget categories
    assert.ok(evt.budget.categories.length >= 5, 'Budget should have at least 5 categories');

    // Validate Milestones & Run of Show
    assert.ok(evt.timelineMilestones.length >= 4, 'Should have at least 4 milestones');
    assert.ok(evt.runOfShow.length >= 4, 'Should have at least 4 run of show cues');

    // Validate Vendors
    assert.ok(evt.vendors.length >= 2, 'Should have at least 2 vendors listed');
  });
});
