import { cryptoRandom, pickIndex } from './random.js';

const FIELDS = ['attending', 'group', 'locked'];

export function normalise(drivers) {
  return drivers.map(({ name, group = null, attending = true, locked = false, bestLapMs = null, attempts = 0, lastSave = null, ...rest }) => (
    { ...rest, name, group, attending, locked, bestLapMs, attempts, lastSave }
  ));
}

// What to save to turn `before` into `after`: only the fields that changed, per driver
export function changesBetween(before, after) {
  const previous = new Map(before.map((driver) => [driver.name, driver]));
  return after.flatMap((driver) => {
    const old = previous.get(driver.name);
    if (!old) return [];
    const fields = Object.fromEntries(FIELDS.filter((field) => old[field] !== driver[field]).map((field) => [field, driver[field]]));
    return Object.keys(fields).length > 0 ? [{ name: driver.name, fields }] : [];
  });
}

export function isNameTaken(roster, name) {
  const wanted = name.trim().toLowerCase();
  return roster.some((driver) => driver.name.toLowerCase() === wanted);
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
