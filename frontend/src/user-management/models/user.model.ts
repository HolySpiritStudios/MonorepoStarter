import { z } from 'zod';

export const AppUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export type AppUser = z.infer<typeof AppUserSchema>;
