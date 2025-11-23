import { and, eq, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../configs/db.ts';
import { attendance } from '../models/attendance-model.ts';
import { checkEvent } from '../models/check-event-model.ts';
import { user } from '../models/user-model.ts';
import { leave } from '../models/leave-model.ts';
import { earlyLeave } from '../models/early-leave-model.ts';

export const checkIn = async (req: Request, res: Response) => {
  const { userId, date, time, location } = req.body;

  await db.transaction(async (tx) => {
    const [insertedAttendance] = await tx
      .insert(attendance)
      .values({
        userId,
        date,
      })
      .returning();

    await tx.insert(checkEvent).values({
      attendanceId: insertedAttendance!.id,
      type: 'CheckIn',
      time,
      location,
      image: req.file!.filename,
    });
  });

  res.status(201).json({ message: 'Check in berhasil!' });
};

export const fieldCheckIn = async (req: Request, res: Response) => {
  const { userId, date, time, location } = req.body;

  const [selectedAttendance] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, String(date)),
        eq(attendance.userId, Number(userId)),
      ),
    )
    .limit(1);

  if (!selectedAttendance) {
    return res.status(400).json({ message: 'Lapangan check in gagal!' });
  }

  await db.insert(checkEvent).values({
    attendanceId: selectedAttendance!.id,
    type: 'FieldCheckIn',
    time,
    location,
    image: req.file!.filename,
  });

  res.status(201).json({ message: 'Lapangan check in berhasil!' });
};

export const fieldCheckOut = async (req: Request, res: Response) => {
  const { userId, date, time, location } = req.body;

  const [selectedAttendance] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, String(date)),
        eq(attendance.userId, Number(userId)),
      ),
    )
    .limit(1);

  if (!selectedAttendance) {
    return res.status(400).json({ message: 'Lapangan check out gagal!' });
  }

  await db.insert(checkEvent).values({
    attendanceId: selectedAttendance!.id,
    type: 'FieldCheckOut',
    time,
    location,
    image: req.file!.filename,
  });

  res.status(201).json({ message: 'Lapangan check out berhasil!' });
};

export const checkOut = async (req: Request, res: Response) => {
  const { userId, date, time, location } = req.body;

  const [selectedAttendance] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, String(date)),
        eq(attendance.userId, Number(userId)),
      ),
    )
    .limit(1);

  if (!selectedAttendance) {
    return res.status(400).json({ message: 'Check out gagal!' });
  }

  await db.insert(checkEvent).values({
    attendanceId: selectedAttendance!.id,
    type: 'CheckOut',
    time,
    location,
    image: req.file!.filename,
  });

  res.status(201).json({ message: 'Check out berhasil!' });
};

export const submitLeave = async (req: Request, res: Response) => {
  const { userId, date, type, time, remarks } = req.body;

  await db.transaction(async (tx) => {
    const [insertedAttendance] = await tx
      .insert(attendance)
      .values({
        userId,
        date,
      })
      .returning();

    await tx.insert(leave).values({
      attendanceId: insertedAttendance!.id,
      type,
      time,
      remarks,
    });
  });

  res.status(201).json({ message: 'Membuat izin berhasil!' });
};

export const submitEarlyLeave = async (req: Request, res: Response) => {
  const { userId, date, type, time, remarks } = req.body;

  const [selectedAttendance] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, String(date)),
        eq(attendance.userId, Number(userId)),
      ),
    )
    .limit(1);

  if (!selectedAttendance) {
    return res.status(400).json({ message: 'Membuat izin gagal!' });
  }

  await db.insert(earlyLeave).values({
    attendanceId: selectedAttendance.id,
    type,
    time,
    remarks,
  });

  res.status(201).json({ message: 'Membuat izin berhasil!' });
};

export const getSingleAttendance = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { date } = req.query;

  const rows = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, String(date)),
        eq(attendance.userId, Number(userId)),
      ),
    )
    .leftJoin(checkEvent, eq(checkEvent.attendanceId, attendance.id))
    .leftJoin(leave, eq(leave.attendanceId, attendance.id))
    .leftJoin(earlyLeave, eq(earlyLeave.attendanceId, attendance.id));

  if (rows.length === 0) return res.json(null);

  const base = rows[0]?.attendance;

  const response = {
    attendance: base,
    checkEvent: rows.map((r) => r.checkEvent).filter((ev) => ev !== null),
    leave: rows[0]?.leave,
    earlyLeave: rows[0]?.earlyLeave,
  };

  return res.json(response);
};

export const getAttendances = async (req: Request, res: Response) => {
  const { day, month } = req.query;

  if ((day && month) || (!day && !month)) {
    return res
      .status(400)
      .json({ error: 'Provide either ?day=YYYY-MM-DD OR ?month=YYYY-MM' });
  }

  let rows;

  if (day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return res.status(400).json({ error: 'Invalid day format (YYYY-MM-DD)' });
    }

    rows = await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, day))
      .innerJoin(user, eq(user.id, attendance.userId))
      .leftJoin(checkEvent, eq(checkEvent.attendanceId, attendance.id));
  }

  if (month) {
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format (YYYY-MM)' });
    }

    const [year, mon] = month.split('-').map(Number);

    rows = await db
      .select()
      .from(attendance)
      .where(
        sql`EXTRACT(month FROM ${attendance.date}) = ${mon}
        AND EXTRACT(year FROM ${attendance.date}) = ${year}`,
      )
      .innerJoin(user, eq(user.id, attendance.userId))
      .leftJoin(checkEvent, eq(checkEvent.attendanceId, attendance.id));
  }

  if (!rows || rows.length === 0) {
    return res.json([]);
  }

  const grouped = Object.values(
    rows.reduce((acc, row) => {
      const a = row.attendance;
      const u = row.user;
      const ev = row.checkEvent;

      if (!acc[a.id]) {
        acc[a.id] = {
          attendance: a,
          user: u,
          checkEvent: [],
        };
      }

      if (ev) acc[a.id].checkEvent.push(ev);

      return acc;
    }, {} as Record<number, any>),
  );

  return res.json(grouped);
};
