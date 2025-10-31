import { z } from 'zod';

export const MagicTokenSchema = z.object({
  token: z.string(),
  username: z.string(),
  userId: z.string(),
  email: z.string().email(),
  expiresAt: z.string(), // ISO timestamp
});

export type MagicToken = z.infer<typeof MagicTokenSchema>;
