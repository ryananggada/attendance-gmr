import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { attendance } from './attendance-model.ts';
import { session } from './session-model.ts';
import { department } from './department-model.ts';
import { fieldAttendance } from './field-attendance-model.ts';

export const roleEnum = pgEnum('role', ['Admin', 'User']);

export const user = pgTable('user', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 25 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  fullName: varchar({ length: 100 }).notNull(),
  departmentId: integer().notNull(),
  role: roleEnum().notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  attendance: many(attendance),
  session: many(session),
  department: one(department),
  fieldAttendance: many(fieldAttendance),
}));
