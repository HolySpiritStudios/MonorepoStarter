import { z } from '@hono/zod-openapi';

export const helloWorldResponseSchema = z.object({
  message: z.string().openapi({ example: 'Hello World!' }),
  timestamp: z.string().openapi({ example: '2025-10-31T12:00:00Z' }),
});

export type HelloWorldResponse = z.infer<typeof helloWorldResponseSchema>;
