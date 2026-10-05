import { z } from 'zod';

export const ReadingSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  spreadId: z.string(),
  question: z.string().optional(),
  cards: z.array(
    z.object({
      position: z.number(),
      cardId: z.string(),
      reversed: z.boolean(),
    }),
  ),
  notes: z.string().optional(),
  updatedAt: z.iso.datetime(),
});

export type Reading = z.infer<typeof ReadingSchema>;
