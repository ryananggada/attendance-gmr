import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import { attendance } from './attendance-model.js';
import { session } from './session-model.js';
import { department } from './department-model.js';
import { fieldAttendance } from './field-attendance-model.js';

export const roleEnum = pgEnum('role', ['Admin', 'User']);

export const user = pgTable('user', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 25 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  fullName: varchar({ length: 100 }).notNull(),
  departmentId: integer().notNull(),
  role: roleEnum().notNull(),
  isDeleted: boolean().default(false),
});

export const userRelations = relations(user, ({ one, many }) => ({
  attendance: many(attendance),
  session: many(session),
  department: one(department),
  fieldAttendance: many(fieldAttendance),
}));
