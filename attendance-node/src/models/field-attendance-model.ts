import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  pgTable,
  point,
  text,
  time,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './user-model.ts';

export const fieldAttendance = pgTable('fieldAttendance', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  date: date().notNull(),
  customer: varchar().notNull(),
  personInCharge: varchar().notNull(),
  remarks: text(),
  image: varchar(),
  time: time().notNull(),
  location: point().notNull(),
});

export const fieldAttendanceRelations = relations(
  fieldAttendance,
  ({ one }) => ({
    user: one(user, {
      fields: [fieldAttendance.userId],
      references: [user.id],
    }),
  }),
);
