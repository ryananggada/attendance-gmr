import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { user } from './user-model.ts';

export const department = pgTable('department', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  isField: boolean().notNull(),
});

export const departmentRelations = relations(department, ({ many }) => ({
  user: many(user),
}));
