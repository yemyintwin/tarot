import type { Card } from '@tarot/shared';
import { secureRandomIndex, shuffle, type RandomIndex } from './shuffle';

export interface DrawnCard {
  cardId: string;
  position: number;
  reversed: boolean;
}

export function drawCards(
  cards: readonly Card[],
  count: number,
  allowReversed: boolean,
  randomIndex: RandomIndex = secureRandomIndex,
) {
  if (!Number.isInteger(count) || count < 1 || count > cards.length) {
    throw new RangeError(`Cannot draw ${count} cards from a deck of ${cards.length}.`);
  }

  const deck = shuffle(cards, randomIndex);
  return deck.slice(0, count).map((card, position) => ({
    cardId: card.id,
    position,
    reversed: allowReversed && randomIndex(2) === 1,
  }));
}
