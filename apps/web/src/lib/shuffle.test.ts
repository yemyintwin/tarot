import { describe, expect, it } from 'vitest';
import { drawCards } from './draw';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('uses Fisher-Yates swaps and preserves every item', () => {
    const shuffled = shuffle([1, 2, 3, 4], (max) => max - 1);

    expect(shuffled).toEqual([1, 2, 3, 4]);
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate its input', () => {
    const cards = ['a', 'b', 'c'];
    shuffle(cards, () => 0);
    expect(cards).toEqual(['a', 'b', 'c']);
  });
});

describe('drawCards', () => {
  const cards = Array.from({ length: 12 }, (_, number) => ({
    id: `card-${number}`,
    name: `Card ${number}`,
    arcana: 'major' as const,
    number,
    keywords: { upright: [], reversed: [] },
    meaning: { upright: '', reversed: '' },
    image: `/cards/card-${number}.webp`,
  }));

  it('draws unique cards into consecutive positions', () => {
    const drawn = drawCards(cards, 10, false, () => 0);

    expect(drawn).toHaveLength(10);
    expect(new Set(drawn.map(({ cardId }) => cardId)).size).toBe(10);
    expect(drawn.map(({ position }) => position)).toEqual(
      Array.from({ length: 10 }, (_, index) => index),
    );
    expect(drawn.every(({ reversed }) => !reversed)).toBe(true);
  });

  it('uses the supplied cryptographic coin values for reversals when enabled', () => {
    const values = [0, 0, 1, 1, 1];
    const drawn = drawCards(cards.slice(0, 3), 3, true, () => values.shift() ?? 0);

    expect(drawn.map(({ reversed }) => reversed)).toEqual([true, true, true]);
  });
});
