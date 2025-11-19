import { integer, pgEnum, pgTable, time, varchar } from 'drizzle-orm/pg-core';

export const earlyLeaveTypeEnum = pgEnum('earlyLeaveType', ['Time', 'Early']);

export const earlyLeave = pgTable('earlyLeave', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attendanceId: integer().notNull(),
  type: earlyLeaveTypeEnum().notNull(),
  time: time().notNull(),
  remarks: varchar(),
});
