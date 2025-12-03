import type { Request, Response, NextFunction } from 'express'; 
import { fromSessionTokenToSessionId } from '../lib/session.ts';
import { db } from '../configs/db.ts';
import { session } from '../models/session-model.ts';
import { eq } from 'drizzle-orm';

export const requireSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.session;
  
    if (!token) {
      return res.status(401).json({ message: 'Token sesi hilang' });
    }
  
    const sessionId = fromSessionTokenToSessionId(token);
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
  
    req.session = result;
    req.userId = result.userId;

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Verifikasi sesi gagal' });
  }
}