import { cryptoRandom, pickIndex } from './draw.js';

export function normalise(drivers) {
  return drivers.map(({ name, group = null, attending = true, locked = false }) => ({ name, group, attending, locked }));
}

export function updateDriver(roster, name, changes) {
  return roster.map((driver) => (driver.name === name ? { ...driver, ...changes } : driver));
}

export function membersOf(roster, group) {
  return roster.filter((driver) => driver.attending && driver.group === group);
}

// Locked drivers keep their group. Everyone else who's coming is dealt into the
// smallest group, earliest group first on a tie, so sizes never differ by more than one
// unless the locked drivers already make them uneven.
export function shuffleIntoGroups(roster, groupIds, random = cryptoRandom) {
  const staysPut = (driver) => driver.locked && driver.group !== null;
  const sizes = new Map(groupIds.map((id) => [id, membersOf(roster, id).filter(staysPut).length]));

  const assigned = new Map();
  for (const driver of shuffle(roster.filter((d) => d.attending && !staysPut(d)), random)) {
    const group = groupIds.reduce((smallest, id) => (sizes.get(id) < sizes.get(smallest) ? id : smallest));
    assigned.set(driver.name, group);
    sizes.set(group, sizes.get(group) + 1);
  }

  return roster.map((driver) => (staysPut(driver) ? driver : { ...driver, group: assigned.get(driver.name) ?? null }));
}

function shuffle(items, random) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = pickIndex(i + 1, random);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
