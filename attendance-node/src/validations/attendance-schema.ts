import { z } from 'zod';

export const createAttendanceSchema = z.object({
  userId: z.coerce.number('User ID dibutuhkan'),
  date: z
    .string('Tanggal dibutuhkan')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  time: z
    .string('Waktu dibutuhkan')
    .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val),
      'Waktu harus di format HH:mm:ss',
    ),
  location: z
    .tuple([
      z.number().min(-90).max(90, 'Latitude harus di antara -90 and 90'),
      z.number().min(-180).max(180, 'Longitude harus di antara -180 and 180'),
    ])
    .refine(
      (val) => val.length === 2,
      'Lokasi harus di format [latitude, longitude]',
    ),
});

export const leaveSchema = z.object({
  userId: z.coerce.number('User ID dibutuhkan'),
  date: z
    .string('Tanggal dibutuhkan')
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Tanggal harus di format YYYY-MM-DD',
    ),
  type: z.enum(['Leave', 'Sick']),
  time: z
    .string('Waktu dibutuhkan')
    .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val),
      'Waktu harus di format HH:mm:ss',
    ),
  remarks: z.string().optional(),
});

export const earlyLeaveSchema = z.object({
  userId: z.coerce.number('User ID dibutuhkan'),
  date: z
    .string('Tanggal dibuthkan')
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Tanggal harus di format YYYY-MM-DD',
    ),
  type: z.enum(['Time', 'Early']),
  time: z
    .string('Waktu dibutuhkan')
    .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val),
      'Waktu harus di format HH:mm:ss',
    ),
  remarks: z.string().optional(),
});
