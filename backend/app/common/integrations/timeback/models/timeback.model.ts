import { z } from 'zod';

export const timeBackCredentialsSchema = z.object({
  timeBackClientId: z.string(),
  timeBackClientSecret: z.string(),
});

export const timeBackTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
});

export const timeBackConfigSchema = z.object({
  baseUrl: z.string().url(),
});

export type TimeBackCredentials = z.infer<typeof timeBackCredentialsSchema>;
export type TimeBackTokenResponse = z.infer<typeof timeBackTokenResponseSchema>;
export type TimeBackConfig = z.infer<typeof timeBackConfigSchema>;
