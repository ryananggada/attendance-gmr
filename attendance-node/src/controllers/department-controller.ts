import type { Request, Response } from 'express';

import { db } from '../configs/db.ts';
import { department } from '../models/department-model.ts';
import { eq } from 'drizzle-orm';

export const createDepartment = async (req: Request, res: Response) => {
  const newDepartment = req.body;

  const [inserted] = await db
    .insert(department)
    .values(newDepartment)
    .returning();

  res.status(201).json(inserted);
};

export const getDepartments = async (_req: Request, res: Response) => {
  const allDepartments = await db
    .select()
    .from(department)
    .orderBy(department.id);

  res.json(allDepartments);
};

export const getDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [selectedDepartment] = await db
    .select()
    .from(department)
    .where(eq(department.id, Number(id)));

  if (!selectedDepartment) {
    return res.status(404).json({ message: 'Department not found.' });
  }
  res.json(selectedDepartment);
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const [updatedDepartment] = await db
    .update(department)
    .set(updateData)
    .where(eq(department.id, Number(id)))
    .returning();

  if (!updatedDepartment) {
    return res.status(404).json({ message: 'Department not found.' });
  }
  res.json(updatedDepartment);
};
