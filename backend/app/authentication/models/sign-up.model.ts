import { z } from 'zod';

import { UserSchema } from '../../common/entities/user.entity';

import { signUpSchema } from './sign-up.schema';

export const signUpRequestSchema = signUpSchema;
export const signUpResponseSchema = UserSchema;

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
