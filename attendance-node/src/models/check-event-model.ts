import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  point,
  time,
  varchar,
} from 'drizzle-orm/pg-core';
import { attendance } from './attendance-model.js';

export const typeEnum = pgEnum('type', [
  'CheckIn',
  'FieldCheckIn',
  'FieldCheckOut',
  'CheckOut',
]);

export const checkEvent = pgTable('checkEvent', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attendanceId: integer().notNull(),
  type: typeEnum().notNull(),
  time: time().notNull(),
  location: point().notNull(),
  image: varchar(),
});

export const checkEventRelations = relations(checkEvent, ({ one }) => ({
  attendance: one(attendance, {
    fields: [checkEvent.attendanceId],
    references: [attendance.id],
  }),
}));
