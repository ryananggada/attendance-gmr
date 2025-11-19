import { relations } from 'drizzle-orm';
import { date, integer, pgTable } from 'drizzle-orm/pg-core';
import { user } from './user-model.ts';
import { checkEvent } from './check-event-model.ts';
import { leave } from './leave-model.ts';
import { earlyLeave } from './early-leave-model.ts';

export const attendance = pgTable('attendance', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  date: date().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
  user: one(user, {
    fields: [attendance.userId],
    references: [user.id],
  }),
  checkEvent: many(checkEvent),
  leave: one(leave),
  earlyLeave: one(earlyLeave),
}));
