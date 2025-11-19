import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, time, varchar } from 'drizzle-orm/pg-core';
import { attendance } from './attendance-model.ts';

export const leaveTypeEnum = pgEnum('leaveType', ['Sick', 'Leave']);

export const leave = pgTable('leave', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attendanceId: integer().notNull(),
  type: leaveTypeEnum().notNull(),
  time: time().notNull(),
  remarks: varchar(),
});

export const leaveRelations = relations(leave, ({ one }) => ({
  user: one(attendance, {
    fields: [leave.attendanceId],
    references: [attendance.id],
  }),
}));
