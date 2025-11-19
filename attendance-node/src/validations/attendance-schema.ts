import { z } from 'zod';

export const createAttendanceSchema = z.object({
  userId: z.coerce.number('User ID is required.'),
  date: z
    .string('Date is required.')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format.'),
  time: z
    .string('Time is required.')
    .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val),
      'Time must be in format HH:mm:ss.',
    ),
  location: z
    .tuple([
      z.number().min(-90).max(90, 'Latitude must be between -90 and 90.'),
      z.number().min(-180).max(180, 'Longitude must be between -180 and 180.'),
    ])
    .refine(
      (val) => val.length === 2,
      'Location must be [latitude, longitude].',
    ),
});

export const leaveSchema = z.object({
  userId: z.coerce.number('User ID is required.'),
  date: z
    .string('Date is required.')
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date must be in format YYYY-MM-DD.',
    ),
  type: z.enum(['Leave', 'Sick']),
  time: z
    .string('Time is required.')
    .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val),
      'Time must be in format HH:mm:ss.',
    ),
  remarks: z.string().optional(),
});
