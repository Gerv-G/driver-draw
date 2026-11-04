import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changesBetween, isNameTaken, membersOf, normalise, shuffleIntoGroups, updateDriver } from '../roster.js';

const GROUP_IDS = ['A', 'B', 'C', 'D', 'E'];
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

test('normalise keeps extra fields such as the stored id', () => {
  assert.equal(normalise([{ id: 'kier', name: 'Kier' }])[0].id, 'kier');
});

test('changesBetween lists only the fields that changed, per driver', () => {
  const before = normalise([{ name: 'Kier', group: 'A' }, { name: 'Rob', group: 'A' }, { name: 'Sean', group: 'B' }]);
  const after = updateDriver(updateDriver(before, 'Kier', { group: 'D', locked: true }), 'Sean', { attending: false });
  assert.deepEqual(changesBetween(before, after), [
    { name: 'Kier', fields: { group: 'D', locked: true } },
    { name: 'Sean', fields: { attending: false } },
  ]);
});

test('changesBetween is empty when nothing changed', () => {
  const roster = normalise([{ name: 'Kier', group: 'A' }]);
  assert.deepEqual(changesBetween(roster, shuffleIntoGroups(roster, ['A'], 5)), []);
});

test('isNameTaken ignores case and surrounding spaces', () => {
  const roster = normalise([{ name: 'Kier' }]);
  assert.equal(isNameTaken(roster, '  kier '), true);
  assert.equal(isNameTaken(roster, 'Kiera'), false);
});

test('updateDriver changes only the named driver', () => {
  const roster = normalise([{ name: 'Kier', group: 'A' }, { name: 'Rob', group: 'A' }]);
  assert.deepEqual(updateDriver(roster, 'Kier', { group: 'D' }), normalise([{ name: 'Kier', group: 'D' }, { name: 'Rob', group: 'A' }]));
});

test('membersOf leaves out drivers who are not coming', () => {
  const roster = normalise([{ name: 'Kier', group: 'A' }, { name: 'Rob', group: 'A', attending: false }]);
  assert.deepEqual(names(membersOf(roster, 'A')), ['Kier']);
});

test('shuffling fills each group up to the rig count, in heat order', () => {
  assert.deepEqual(groupSizes(shuffleIntoGroups(rosterOf(21), GROUP_IDS, 5)), [5, 5, 5, 5, 1]);
  assert.deepEqual(groupSizes(shuffleIntoGroups(rosterOf(14), GROUP_IDS, 5)), [5, 5, 4, 0, 0]);
});

test('drivers beyond what the rigs can take go to the smallest groups, earliest first', () => {
  assert.deepEqual(groupSizes(shuffleIntoGroups(rosterOf(12), GROUP_IDS, 2)), [3, 3, 2, 2, 2]);
});

test('shuffling takes drivers who are not coming out of their group', () => {
  const roster = [...rosterOf(8), ...normalise([{ name: 'Sean', group: 'A', attending: false }])];
  const sean = shuffleIntoGroups(roster, GROUP_IDS, 5).find((driver) => driver.name === 'Sean');
  assert.equal(sean.group, null);
});

test('shuffling keeps locked drivers in their group and counts them towards its size', () => {
  const roster = [
    ...rosterOf(19),
    ...normalise([{ name: 'Nick', group: 'C', locked: true }, { name: 'Gervin', group: 'E', locked: true }]),
  ];
  for (let run = 0; run < 50; run++) {
    const shuffled = shuffleIntoGroups(roster, GROUP_IDS, 5);
    assert.equal(shuffled.find((driver) => driver.name === 'Nick').group, 'C');
    assert.equal(shuffled.find((driver) => driver.name === 'Gervin').group, 'E');
    assert.deepEqual(groupSizes(shuffled), [5, 5, 5, 5, 1]);
  }
});

test('a locked driver with no group is dealt like everyone else', () => {
  const roster = [...rosterOf(3), ...normalise([{ name: 'Kier', locked: true }])];
  assert.notEqual(shuffleIntoGroups(roster, GROUP_IDS, 5).find((driver) => driver.name === 'Kier').group, null);
});

test('shuffling actually mixes drivers across groups', () => {
  const seen = new Set();
  for (let run = 0; run < 200; run++) {
    seen.add(shuffleIntoGroups(rosterOf(10), GROUP_IDS, 2).find((driver) => driver.name === 'Driver 1').group);
  }
  assert.deepEqual([...seen].sort(), GROUP_IDS);
});
