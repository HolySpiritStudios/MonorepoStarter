import { z } from 'zod';

// Define validation schema using Zod
export const SignInFormDataSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type SignInFormData = z.infer<typeof SignInFormDataSchema>;
