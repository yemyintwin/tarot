import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string(),
  name: z.string(),
  arcana: z.enum(['major', 'minor']),
  suit: z.enum(['wands', 'cups', 'swords', 'pentacles']).optional(),
  number: z.number(),
  keywords: z.object({
    upright: z.array(z.string()),
    reversed: z.array(z.string()),
  }),
  meaning: z.object({
    upright: z.string(),
    reversed: z.string(),
  }),
  image: z.string(),
});

export type Card = z.infer<typeof CardSchema>;
