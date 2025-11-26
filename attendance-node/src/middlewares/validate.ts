import type { Request, Response, NextFunction } from 'express';
import { z, ZodObject } from 'zod';

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const rawBody = req.body;

    const normalizedBody = Object.fromEntries(
      Object.entries(rawBody).map(([key, value]) => {
        if (typeof value === 'string') {
          try {
            return [key, JSON.parse(value)];
          } catch {
            return [key, value];
          }
        }
        return [key, value];
      }),
    );

    const result = schema.safeParse(normalizedBody);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validasi gagal.',
        errors: z.treeifyError(result.error),
      });
    }

    req.body = result.data;
    next();

    /*
    let parsedBody = { ...req.body };

    for (const key in parsedBody) {
      const value = parsedBody[key];
      if (typeof value === 'string') {
        try {
          parsedBody[key] = JSON.parse(value);
        } catch {}
      }
    }

    if (req.file) {
      parsedBody.image = req.file;
    }
  

    const result = schema.safeParse(parsedBody);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.treeifyError(result.error),
      });
    }

    req.body = result.data;
    next();
    */
  };
