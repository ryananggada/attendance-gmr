import bcrypt from 'bcrypt';
import { eq, and, getTableColumns } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { user } from '../models/user-model.js';
import { db } from '../configs/db.js';
import { department } from '../models/department-model.js';

const userColumns = getTableColumns(user);
const departmentColumns = getTableColumns(department);

const { password, ...userWithoutPassword } = userColumns;

export const createUser = async (req: Request, res: Response) => {
  const newUser = req.body;
  const hashedPassword = bcrypt.hashSync(newUser.password, 12);
  newUser.password = hashedPassword;

  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.username, newUser.username));

  if (existing) {
    return res.status(409).json({ message: 'Username sudah digunakan' });
  }

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
    .where(eq(user.isDeleted, false))
    .orderBy(user.id);

  res.json(allUsers);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [selectedUser] = await db
    .select({ ...userWithoutPassword })
    .from(user)
    .where(and(eq(user.id, Number(id)), eq(user.isDeleted, false)));

  if (!selectedUser) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.json(selectedUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<typeof user.$inferInsert> = { ...req.body };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }

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

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [selectedUser] = await db
    .select({ ...userWithoutPassword })
    .from(user)
    .where(eq(user.id, Number(id)));

  if (!selectedUser) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const [updatedUser] = await db
    .update(user)
    .set({ isDeleted: true })
    .where(eq(user.id, Number(id)))
    .returning(userWithoutPassword);

  if (!updatedUser) {
    return res.status(500).json({ message: 'User gagal dihapus' });
  }

  res.json({ message: 'User telah dihapus' });
};
