import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    fullName: z.string().min(1, 'Full name is required'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Need to confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Need to confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
