import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatGap, formatLapTime, isPersonalBest, leaderboard, parseLapTime } from '../laptimes.js';
import { normalise } from '../roster.js';

test('parseLapTime reads minutes, seconds and thousandths', () => {
  assert.equal(parseLapTime('2:31.402'), 151402);
  assert.equal(parseLapTime(' 2:31.4 '), 151400);
  assert.equal(parseLapTime('2:05'), 125000);
  assert.equal(parseLapTime('151.402'), 151402);
  assert.equal(parseLapTime('95'), 95000);
});

test('parseLapTime rejects anything that is not a lap time', () => {
  for (const text of ['', 'abc', '2:75.000', '2:31.4021', '1:2:3', '0', '0:00.000', '-1:30']) {
    assert.equal(parseLapTime(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('formatLapTime pads seconds and thousandths', () => {
  assert.equal(formatLapTime(151402), '2:31.402');
  assert.equal(formatLapTime(125005), '2:05.005');
  assert.equal(formatLapTime(59999), '0:59.999');
});

test('a formatted time reads back to the same time', () => {
  for (const ms of [1, 61001, 151402, 599999]) assert.equal(parseLapTime(formatLapTime(ms)), ms);
});

test('formatGap shows seconds behind the leader', () => {
  assert.equal(formatGap(523), '+0.523');
  assert.equal(formatGap(12040), '+12.040');
});

test('isPersonalBest takes the first lap and only faster ones after', () => {
  const [driver] = normalise([{ name: 'Kier' }]);
  assert.equal(isPersonalBest(driver, 151402), true);
  const timed = { ...driver, bestLapMs: 151402 };
  assert.equal(isPersonalBest(timed, 150000), true);
  assert.equal(isPersonalBest(timed, 151402), false);
  assert.equal(isPersonalBest(timed, 160000), false);
});

test('leaderboard ranks drivers who are coming and have a time, fastest first', () => {
  const roster = normalise([
    { name: 'Rob', bestLapMs: 152000 },
    { name: 'Kier', bestLapMs: 151402 },
    { name: 'Mic' },
    { name: 'Sean', bestLapMs: 140000, attending: false },
    { name: 'Gab', bestLapMs: 152000 },
  ]);
  assert.deepEqual(leaderboard(roster).map((driver) => driver.name), ['Kier', 'Gab', 'Rob']);
});
