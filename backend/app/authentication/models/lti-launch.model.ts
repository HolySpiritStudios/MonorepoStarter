import { z } from 'zod';

import { ltiLaunchSchema } from './lti-launch.schema';

export const ltiLaunchRequestSchema = ltiLaunchSchema;
export const ltiLaunchResponseSchema = z.object({
  redirectUrl: z.string().url().describe('URL to redirect the user to after successful LTI launch'),
});

export type LtiLaunchRequest = z.infer<typeof ltiLaunchRequestSchema>;
export type LtiLaunchResponse = z.infer<typeof ltiLaunchResponseSchema>;
