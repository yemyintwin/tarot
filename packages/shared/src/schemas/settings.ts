import { z } from 'zod';

export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().default('en'),
  allowReversed: z.boolean(),
  reducedMotion: z.boolean(),
});

export type Settings = z.infer<typeof SettingsSchema>;
