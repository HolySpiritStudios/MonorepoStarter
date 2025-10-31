import { z } from 'zod';

export const EnvironmentTypeSchema = z.object({
  apiUrl: z.string(),
  userPoolClientId: z.string(),
  userPoolId: z.string(),
  userPoolRegion: z.string(),
  userPoolDomain: z.string(),
  selfSignUpEnabled: z.boolean().optional().default(true),
  ssoSignInEnabled: z.boolean().optional().default(true),
});

export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;
