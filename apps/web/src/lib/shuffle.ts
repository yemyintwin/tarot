export type RandomIndex = (maxExclusive: number) => number;

export function secureRandomIndex(maxExclusive: number) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 2 ** 32) {
    throw new RangeError('maxExclusive must be an integer between 1 and 2^32.');
  }

  const range = 2 ** 32;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return value[0] % maxExclusive;
}

export function shuffle<T>(items: readonly T[], randomIndex: RandomIndex = secureRandomIndex) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = randomIndex(index + 1);
    if (!Number.isInteger(otherIndex) || otherIndex < 0 || otherIndex > index) {
      throw new RangeError(`Random index ${otherIndex} is out of range for ${index + 1} items.`);
    }
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}
