import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickIndex, sliceUnderPointer, spinTo } from '../draw.js';

test('pickIndex covers the first and last entrant', () => {
  assert.equal(pickIndex(5, () => 0), 0);
  assert.equal(pickIndex(5, () => 0.999999), 4);
});

test('pickIndex refuses an empty draw', () => {
  assert.throws(() => pickIndex(0), RangeError);
});

test('pickIndex gives every entrant a fair chance', () => {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < 4000; i++) counts[pickIndex(4)]++;
  for (const count of counts) assert.ok(count > 800 && count < 1200, `uneven draw: ${counts}`);
});

test('the wheel stops with the drawn entrant under the pointer', () => {
  for (const count of [1, 2, 5, 6, 22]) {
    for (let index = 0; index < count; index++) {
      for (const start of [0, 137.5, 12345.6]) {
        for (const r of [0, 0.5, 0.999999]) {
          const rotation = spinTo(start, index, count, { random: () => r });
          assert.equal(sliceUnderPointer(rotation, count), index, `count=${count} index=${index} start=${start} r=${r}`);
        }
      }
    }
  }
});

test('the wheel always spins forward by at least the requested turns', () => {
  const rotation = spinTo(90, 3, 6, { turns: 4, random: () => 0.5 });
  assert.ok(rotation >= 90 + 4 * 360);
  assert.ok(rotation < 90 + 5 * 360);
});
