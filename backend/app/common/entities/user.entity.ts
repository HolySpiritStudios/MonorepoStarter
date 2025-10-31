import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().describe('Unique user identifier within our app'),
  email: z.string().email(),
  fullName: z.string(),
  platformId: z.string().optional().describe('External platform identifier (e.g., LMS user ID)'),
});

export type User = z.infer<typeof UserSchema>;
