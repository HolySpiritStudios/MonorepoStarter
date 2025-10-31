import { z } from 'zod';

export const CommonSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type CommonSuccessResponse = z.infer<typeof CommonSuccessResponseSchema>;
