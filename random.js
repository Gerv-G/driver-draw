export function cryptoRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

export function pickIndex(count, random = cryptoRandom) {
  if (count < 1) throw new RangeError('Nothing to pick from');
  return Math.floor(random() * count);
}
