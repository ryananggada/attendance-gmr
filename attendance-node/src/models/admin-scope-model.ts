import { integer, pgTable } from 'drizzle-orm/pg-core';
import { user } from './user-model.js';
import { relations } from 'drizzle-orm';
import { department } from './department-model.js';

export const adminScope = pgTable('adminScope', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  departmentId: integer().notNull(),
});

export const adminScopeRelations = relations(adminScope, ({ one }) => ({
  user: one(user),
  department: one(department),
}));
