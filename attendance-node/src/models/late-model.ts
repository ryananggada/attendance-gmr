import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const late = pgTable('late', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attendanceId: integer().notNull(),
  remarks: varchar(),
});
