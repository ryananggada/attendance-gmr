import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { user } from '../models/user-model.js';
import { db } from '../configs/db.js';
import {
  generateRandomSessionToken,
  fromSessionTokenToSessionId,
} from '../lib/session.js';
import { session } from '../models/session-model.js';
import { department } from '../models/department-model.js';

dotenv.config();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const [selectedUser] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .innerJoin(department, eq(department.id, user.departmentId));

  if (!selectedUser) {
    return res.status(401).json({ message: 'Username atau password salah!' });
  }

  const isCorrectPass = await bcrypt.compare(
    password,
    selectedUser.user.password,
  );
  if (!isCorrectPass) {
    return res.status(401).json({ message: 'Username atau password salah!' });
  }

  const sessionToken = generateRandomSessionToken();
  const sessionId = fromSessionTokenToSessionId(sessionToken);
  const [curSession] = await db
    .insert(session)
    .values({
      id: sessionId,
      userId: selectedUser.user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })
    .returning();

  res.cookie('session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.json({
    message: 'Login berhasil!',
    user: {
      id: selectedUser!.user.id,
      username: selectedUser!.user.username,
      fullName: selectedUser!.user.fullName,
      role: selectedUser!.user.role,
      department: selectedUser!.department,
    },
    session: curSession,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.session) {
    return res.status(401).json({ message: 'Token sesi hilang' });
  }

  const sessionId = fromSessionTokenToSessionId(cookies.session);
  const [result] = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId));

  if (!result) {
    return res.status(401).json({ message: 'Sesi tidak ditemukan' });
  }

  if (Date.now() >= result.expiresAt.getTime()) {
    await db.delete(session).where(eq(session.id, sessionId));

    return res.status(401).json({ message: 'Sesi kedaluarsa' });
  }

  const [selectedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, result.userId))
    .innerJoin(department, eq(department.id, user.departmentId));

  res.json({
    user: {
      id: selectedUser!.user.id,
      username: selectedUser!.user.username,
      fullName: selectedUser!.user.fullName,
      role: selectedUser!.user.role,
      department: selectedUser!.department,
    },
    session: result,
  });
};

export const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.session) {
    return res.sendStatus(204);
  }

  const sessionId = fromSessionTokenToSessionId(cookies.session);
  await db.delete(session).where(eq(session.id, sessionId));

  res.clearCookie('session', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ message: 'Logout berhasil' });
};
