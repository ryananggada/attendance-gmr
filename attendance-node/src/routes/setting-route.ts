import express from 'express';
import { clearUploads } from '../utils/clearImages.js';

const router = express.Router();

router.delete('/uploads', async (_, res) => {
  try {
    await clearUploads();

    res.json({
      success: true,
      message: 'Semua foto telah dihapus',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

export default router;
