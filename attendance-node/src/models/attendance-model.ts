import { relations } from 'drizzle-orm';
import { date, integer, pgTable } from 'drizzle-orm/pg-core';
import { user } from './user-model.js';
import { checkEvent } from './check-event-model.js';
import { leave } from './leave-model.js';
import { earlyLeave } from './early-leave-model.js';

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
