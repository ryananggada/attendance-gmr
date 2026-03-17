import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(1, 'Username dibutuhkan'),
  fullName: z.string().min(1, 'Nama dibutuhkan'),
  password: z
    .string()
    .min(1, 'Password dibutuhkan')
    .min(8, 'Password harus 8 karakter atau lebih'),
  departmentId: z.number('Department harus dipilih'),
  role: z.enum(['Super Admin', 'Admin', 'User'], 'Role harus dipilih'),
  allowedDepartmentIds: z.array(z.number()).optional(),
});
