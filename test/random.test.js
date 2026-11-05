import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickIndex } from '../random.js';

test('pickIndex covers the first and last item', () => {
  assert.equal(pickIndex(5, () => 0), 0);
  assert.equal(pickIndex(5, () => 0.999999), 4);
});

test('pickIndex refuses an empty list', () => {
  assert.throws(() => pickIndex(0), RangeError);
});

test('pickIndex gives every item a fair chance', () => {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < 4000; i++) counts[pickIndex(4)]++;
  for (const count of counts) assert.ok(count > 800 && count < 1200, `uneven picks: ${counts}`);
});
