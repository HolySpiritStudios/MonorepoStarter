import { z } from 'zod';

export const ltiLaunchSchema = z.object({
  id_token: z.string().min(1).describe('LTI 1.3 ID token from the learning management system'),
});

export type LtiLaunchRequest = z.infer<typeof ltiLaunchSchema>;
