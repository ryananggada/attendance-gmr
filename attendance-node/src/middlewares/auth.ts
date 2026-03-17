import type { Request, Response, NextFunction } from 'express';
import { fromSessionTokenToSessionId } from '../lib/session.js';
import { session } from '../models/session-model.js';
import { eq } from 'drizzle-orm';
import { db } from '../configs/db.js';
import { adminScope } from '../models/admin-scope-model.js';
import { department } from '../models/department-model.js';
import { user } from '../models/user-model.js';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      return next();
    }

    const sessionId = fromSessionTokenToSessionId(sessionToken);

    const [sessionData] = await db
      .select()
      .from(session)
      .where(eq(session.id, sessionId));

    if (!sessionData || sessionData.expiresAt < new Date()) {
      return next();
    }

    const [userData] = await db
      .select({
        user,
        department,
      })
      .from(user)
      .innerJoin(department, eq(department.id, user.departmentId))
      .where(eq(user.id, sessionData.userId));

    if (!userData) {
      return next();
    }

    const scopes = await db
      .select()
      .from(adminScope)
      .where(eq(adminScope.userId, userData.user.id));

    const allowedDepartmentIds = scopes.map((s) => s.departmentId);

    req.user = {
      id: userData.user.id,
      username: userData.user.username,
      fullName: userData.user.fullName,
      role: userData.user.role,
      department: userData.department,
      allowedDepartmentIds,
    };

    next();
  } catch (error) {
    console.error(error);
    next();
  }
};
