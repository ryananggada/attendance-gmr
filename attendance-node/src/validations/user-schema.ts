import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z.string().min(1, 'Username dibutuhkan'),
    fullName: z.string().min(1, 'Nama dibutuhkan'),
    password: z
      .string()
      .min(1, 'Password dibutuhkan')
      .min(8, 'Password harus 8 karakter atau lebih'),
    confirmPassword: z.string().min(1, 'Confirm password dibutuhkan'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password harus sama password',
    path: ['confirmPassword'],
  });

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1, 'Nama dibutuhkan'),
    password: z
      .string()
      .min(1, 'Password dibutuhkan')
      .min(8, 'Password harus 8 karakter atau lebih'),
    confirmPassword: z.string().min(1, 'Confirm password dibutuhkan'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password harus sama password',
    path: ['confirmPassword'],
  });
