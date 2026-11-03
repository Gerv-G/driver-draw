import { test } from 'node:test';
import assert from 'node:assert/strict';
import { membersOf, normalise, shuffleIntoGroups, updateDriver } from '../roster.js';

const GROUP_IDS = ['A', 'B', 'C', 'D'];
const names = (drivers) => drivers.map((driver) => driver.name).sort();

function rosterOf(count, extra = {}) {
  return normalise(Array.from({ length: count }, (_, i) => ({ name: `Driver ${i + 1}`, ...extra })));
}

function groupSizes(roster) {
  return GROUP_IDS.map((id) => membersOf(roster, id).length);
}

test('normalise fills in defaults for a bare name', () => {
  assert.deepEqual(normalise([{ name: 'Kier' }]), [{ name: 'Kier', group: null, attending: true, locked: false }]);
});

test('updateDriver changes only the named driver', () => {
  const roster = normalise([{ name: 'Kier', group: 'A' }, { name: 'Rob', group: 'A' }]);
  assert.deepEqual(updateDriver(roster, 'Kier', { group: 'D' }), normalise([{ name: 'Kier', group: 'D' }, { name: 'Rob', group: 'A' }]));
});

test('membersOf leaves out drivers who are not coming', () => {
  const roster = normalise([{ name: 'Kier', group: 'A' }, { name: 'Rob', group: 'A', attending: false }]);
  assert.deepEqual(names(membersOf(roster, 'A')), ['Kier']);
});

test('shuffling puts every driver who is coming into a group, with sizes at most one apart', () => {
  for (const count of [4, 5, 14, 21, 22]) {
    const shuffled = shuffleIntoGroups(rosterOf(count), GROUP_IDS);
    const sizes = groupSizes(shuffled);
    assert.equal(sizes.reduce((a, b) => a + b), count);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `uneven groups for ${count}: ${sizes}`);
  }
});

test('shuffling gives earlier groups the extra drivers', () => {
  assert.deepEqual(groupSizes(shuffleIntoGroups(rosterOf(22), GROUP_IDS)), [6, 6, 5, 5]);
});

test('shuffling takes drivers who are not coming out of their group', () => {
  const roster = [...rosterOf(8), ...normalise([{ name: 'Sean', group: 'A', attending: false }])];
  const sean = shuffleIntoGroups(roster, GROUP_IDS).find((driver) => driver.name === 'Sean');
  assert.equal(sean.group, null);
});

test('shuffling keeps locked drivers in their group and counts them towards its size', () => {
  const roster = [
    ...rosterOf(20),
    ...normalise([{ name: 'Nick', group: 'C', locked: true }, { name: 'Gervin', group: 'D', locked: true }]),
  ];
  for (let run = 0; run < 50; run++) {
    const shuffled = shuffleIntoGroups(roster, GROUP_IDS);
    assert.equal(shuffled.find((driver) => driver.name === 'Nick').group, 'C');
    assert.equal(shuffled.find((driver) => driver.name === 'Gervin').group, 'D');
    assert.deepEqual(groupSizes(shuffled), [6, 6, 5, 5]);
  }
});

test('a locked driver with no group is dealt like everyone else', () => {
  const roster = [...rosterOf(3), ...normalise([{ name: 'Kier', locked: true }])];
  assert.notEqual(shuffleIntoGroups(roster, GROUP_IDS).find((driver) => driver.name === 'Kier').group, null);
});

test('shuffling actually mixes drivers across groups', () => {
  const seen = new Set();
  for (let run = 0; run < 200; run++) {
    seen.add(shuffleIntoGroups(rosterOf(8), GROUP_IDS).find((driver) => driver.name === 'Driver 1').group);
  }
  assert.deepEqual([...seen].sort(), GROUP_IDS);
});
