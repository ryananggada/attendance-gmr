import fs from 'fs';

export const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const generateFilename = (originalMime: string) => {
  const ext = originalMime.split('/')[1];
  return `IMG-${Date.now()}-${Math.round(Math.random() * 10000)}.${ext}`;
};
