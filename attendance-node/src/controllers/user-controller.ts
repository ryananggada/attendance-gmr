import bcrypt from 'bcrypt';
import { eq, getTableColumns } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { user } from '../models/user-model.ts';
import { db } from '../configs/db.ts';
import { department } from '../models/department-model.ts';

const userColumns = getTableColumns(user);
const departmentColumns = getTableColumns(department);

const { password, ...userWithoutPassword } = userColumns;

export const createUser = async (req: Request, res: Response) => {
  const newUser = req.body;
  const hashedPassword = bcrypt.hashSync(newUser.password, 12);
  newUser.password = hashedPassword;

  const [inserted] = await db
    .insert(user)
    .values(newUser)
    .returning(userWithoutPassword);
  res.status(201).json(inserted);
};

export const getUsers = async (_req: Request, res: Response) => {
  const allUsers = await db
    .select({ user: userWithoutPassword, department: departmentColumns })
    .from(user)
    .innerJoin(department, eq(department.id, user.departmentId))
    .orderBy(user.id);

  res.json(allUsers);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [selectedUser] = await db
    .select({ ...userWithoutPassword })
    .from(user)
    .where(eq(user.id, Number(id)));

  if (!selectedUser) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.json(selectedUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<typeof user.$inferInsert> = req.body;

  const [updatedUser] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, Number(id)))
    .returning(userWithoutPassword);

  if (!updatedUser) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.json(updatedUser);
};
