import { and, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { fieldAttendance } from '../models/field-attendance-model.js';
import { db } from '../configs/db.js';

export const createFieldAttendance = async (req: Request, res: Response) => {
  const newFieldAttendance = req.body;
  newFieldAttendance.image = req.file!.filename;
  newFieldAttendance.location = JSON.parse(newFieldAttendance.location);

  const [inserted] = await db
    .insert(fieldAttendance)
    .values(newFieldAttendance)
    .returning();

  res.status(201).json(inserted);
};

export const getFieldAttendances = async (req: Request, res: Response) => {
  const { date, userId } = req.query;
  const allFieldAttendances = await db
    .select()
    .from(fieldAttendance)
    .where(
      and(
        eq(fieldAttendance.date, String(date)),
        eq(fieldAttendance.userId, Number(userId)),
      ),
    );

  res.json(allFieldAttendances);
};
