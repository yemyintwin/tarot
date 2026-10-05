import { z } from 'zod';

export const SpreadSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  positions: z.array(
    z.object({
      index: z.number(),
      label: z.string(),
      meaning: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  ),
});

export type Spread = z.infer<typeof SpreadSchema>;
