const FULL_TURN = 360;

export function cryptoRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

export function pickIndex(count, random = cryptoRandom) {
  if (count < 1) throw new RangeError('Nothing to draw from');
  return Math.floor(random() * count);
}

// The wheel lays slice 0 clockwise from 12 o'clock, which is where the pointer sits.
export function sliceUnderPointer(rotation, count) {
  const sliceAngle = FULL_TURN / count;
  return Math.floor(mod(-rotation, FULL_TURN) / sliceAngle) % count;
}

export function spinTo(currentRotation, index, count, { turns = 6, random = cryptoRandom } = {}) {
  const sliceAngle = FULL_TURN / count;
  // Stop somewhere inside the slice rather than dead centre, so it doesn't look rigged
  const offset = (random() - 0.5) * sliceAngle * 0.8;
  const target = mod(-(index + 0.5) * sliceAngle - offset, FULL_TURN);
  return currentRotation + turns * FULL_TURN + mod(target - currentRotation, FULL_TURN);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
