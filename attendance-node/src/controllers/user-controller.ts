import bcrypt from 'bcrypt';
import { eq, and, getTableColumns, inArray } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { user } from '../models/user-model.js';
import { db } from '../configs/db.js';
import { department } from '../models/department-model.js';
import { adminScope } from '../models/admin-scope-model.js';

type UpdateUserRequest = Partial<typeof user.$inferInsert> & {
  allowedDepartmentIds?: number[];
};

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

  const allowedDepartmentIds = newUser.allowedDepartmentIds ?? [];
  delete newUser.allowedDepartmentIds;

  const result = await db.transaction(async (tx) => {
    const [insertedUser] = await tx.insert(user).values(newUser).returning();

    if (newUser.role === 'Admin' && allowedDepartmentIds.length) {
      await tx.insert(adminScope).values(
        allowedDepartmentIds.map((deptId: number) => ({
          userId: insertedUser!.id,
          departmentId: deptId,
        })),
      );
    }

    return insertedUser;
  });

  res.status(201).json(result);
};

export const getUsers = async (req: Request, res: Response) => {
  const authUser = req.user;

  if (!authUser) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const conditions = [eq(user.isDeleted, false)];

  if (authUser.role === 'Admin') {
    const allowedIds = authUser.allowedDepartmentIds ?? [];

    if (allowedIds.length > 0) {
      conditions.push(inArray(user.departmentId, allowedIds));
    } else {
      return res.json([]);
    }
  }

  const allUsers = await db
    .select({ user: userWithoutPassword, department: departmentColumns })
    .from(user)
    .innerJoin(department, eq(department.id, user.departmentId))
    .where(and(...conditions))
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

  const scopes = await db
    .select()
    .from(adminScope)
    .where(eq(adminScope.userId, Number(id)));
  const allowedDepartmentIds = scopes.map((s) => s.departmentId);

  res.json({ ...selectedUser, allowedDepartmentIds });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body: UpdateUserRequest = req.body;
  const { allowedDepartmentIds = [], ...updateData } = body;

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }

  const result = await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(user)
      .set(updateData)
      .where(eq(user.id, Number(id)))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (updateData.role === 'Admin') {
      await tx.delete(adminScope).where(eq(adminScope.userId, Number(id)));

      if (allowedDepartmentIds?.length) {
        await tx.insert(adminScope).values(
          allowedDepartmentIds.map((deptId) => ({
            userId: Number(id),
            departmentId: deptId,
          })),
        );
      }
    } else {
      await tx.delete(adminScope).where(eq(adminScope.userId, Number(id)));
    }

    return updatedUser;
  });

  res.json(result);
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
