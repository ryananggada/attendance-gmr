import express from 'express';
import {
  createFieldAttendance,
  getFieldAttendances,
} from '../controllers/field-attendance-controller.js';
import { uploadAndCompress } from '../middlewares/multer.js';

const router = express.Router();

router.post('/', uploadAndCompress.single('image'), createFieldAttendance);
router.get('/', getFieldAttendances);

export default router;
