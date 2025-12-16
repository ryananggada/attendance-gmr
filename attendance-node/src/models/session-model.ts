import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { user } from './user-model.js';

export const session = pgTable('session', {
  id: varchar().primaryKey().notNull(),
  userId: integer().notNull(),
  expiresAt: timestamp().notNull(),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
