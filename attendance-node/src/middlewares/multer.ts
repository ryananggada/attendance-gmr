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
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file format'));
  },
  limits: {
    fileSize: 1024 * 1024 * 1,
  },
});
