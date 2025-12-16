import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { ensureDir, generateFilename } from '../utils/file.js';
import { __dirname } from '../utils/path.js';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format gambar tidak valid'));
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
          .resize({ width: 960 })
          .jpeg()
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
