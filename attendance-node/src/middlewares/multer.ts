import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { ensureDir, generateFilename } from '../utils/file.ts';
import { __dirname } from '../utils/path.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file format'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDir = path.join(__dirname, '../uploads');

export const uploadAndCompress = {
  single: (fieldName: string) => [
    upload.single(fieldName),
    async (
      req: {
        file: {
          mimetype: string;
          buffer: sharp.SharpOptions | undefined;
          filename: string;
          path: string;
          url: string;
        };
      },
      _res: any,
      next: any,
    ) => {
      try {
        if (!req.file) return next();

        ensureDir(uploadDir);

        const filename = generateFilename(req.file.mimetype);
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
          .resize({ width: 1080 })
          .jpeg({ quality: 75 })
          .toFile(filepath);

        req.file.filename = filename;
        req.file.path = filepath;
        req.file.url = `/uploads/${filename}`;

        next();
      } catch (err) {
        next(err);
      }
    },
  ],
};

/*
import { type Request } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { __dirname } from '../utils/path.ts';

const uploadDir = path.join(__dirname + '/../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `IMG-${Date.now()}-${Math.round(Math.random() * 10000)}.${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowed = ['image/jpeg', 'image/png'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file format'));
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});
*/
