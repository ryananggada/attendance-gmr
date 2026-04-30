import fs from 'fs/promises';
import path from 'path';
import { __dirname } from './path.js';

const uploadsPath = path.join(__dirname, '../uploads');

export const clearUploads = async () => {
  try {
    const files = await fs.readdir(uploadsPath);

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadsPath, file);

        const stat = await fs.lstat(filePath);

        if (stat.isFile()) {
          await fs.unlink(filePath);
        }
      }),
    );

    return {
      success: true,
      deleted: files.length,
    };
  } catch (err) {
    throw err;
  }
};
