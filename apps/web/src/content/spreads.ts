import type { Spread } from '@tarot/shared';

export const spreads: Spread[] = [
  {
    id: 'one-card',
    name: 'One Card',
    description: 'A single card for a simple point of reflection.',
    positions: [
      { index: 0, label: 'Guidance', meaning: 'A perspective for this moment.', x: 50, y: 50 },
    ],
  },
  {
    id: 'three-card',
    name: 'Three Card',
    description: 'A three-card reflection on the past, present, and future.',
    positions: [
      { index: 0, label: 'Past', meaning: 'What has shaped this moment.', x: 20, y: 50 },
      { index: 1, label: 'Present', meaning: 'What is present now.', x: 50, y: 50 },
      { index: 2, label: 'Future', meaning: 'What may be unfolding.', x: 80, y: 50 },
    ],
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'A ten-card spread for a layered view of a situation.',
    positions: [
      { index: 0, label: 'Present', meaning: 'The heart of the matter.', x: 40, y: 50 },
      { index: 1, label: 'Challenge', meaning: 'What crosses or challenges you.', x: 40, y: 50 },
      { index: 2, label: 'Foundation', meaning: 'The underlying foundation.', x: 40, y: 78 },
      { index: 3, label: 'Recent Past', meaning: 'What is receding into the past.', x: 15, y: 50 },
      { index: 4, label: 'Possible Outcome', meaning: 'A possibility to consider.', x: 40, y: 22 },
      { index: 5, label: 'Near Future', meaning: 'What may arrive soon.', x: 65, y: 50 },
      {
        index: 6,
        label: 'Your Approach',
        meaning: 'Your stance toward the situation.',
        x: 85,
        y: 78,
      },
      {
        index: 7,
        label: 'Environment',
        meaning: 'People or circumstances around you.',
        x: 85,
        y: 60,
      },
      {
        index: 8,
        label: 'Hopes and Fears',
        meaning: 'Hopes or concerns influencing you.',
        x: 85,
        y: 40,
      },
      {
        index: 9,
        label: 'Long-term Outcome',
        meaning: 'A longer-term direction to reflect on.',
        x: 85,
        y: 22,
      },
    ],
  },
];
