import { z } from 'zod';

export const SignUpFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type SignUpFormData = z.infer<typeof SignUpFormDataSchema>;
