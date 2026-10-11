import { z } from 'zod';

export const InterpretationRequestSchema = z.object({
  language: z.enum(['en', 'my']),
  question: z.string().max(500).optional(),
  spread: z.object({
    name: z.string().min(1).max(100),
    positions: z
      .array(
        z.object({
          label: z.string().min(1).max(100),
          meaning: z.string().min(1).max(300),
        }),
      )
      .min(1)
      .max(10),
  }),
  cards: z
    .array(
      z.object({
        position: z.number().int().min(0).max(9),
        positionLabel: z.string().min(1).max(100),
        positionMeaning: z.string().min(1).max(300),
        name: z.string().min(1).max(100),
        orientation: z.enum(['upright', 'reversed']),
        keywords: z.array(z.string().max(2000)).max(12),
        meaning: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(10),
});

export const InterpretationResponseSchema = z.object({
  interpretation: z.string().min(1).max(8000),
});

export type InterpretationRequest = z.infer<typeof InterpretationRequestSchema>;
export type InterpretationResponse = z.infer<typeof InterpretationResponseSchema>;
