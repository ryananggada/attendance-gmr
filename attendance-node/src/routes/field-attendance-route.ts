import express from 'express';
import {
  createFieldAttendance,
  getFieldAttendances,
} from '../controllers/field-attendance-controller.ts';
import { uploadAndCompress } from '../middlewares/multer.ts';

const router = express.Router();

router.post('/', uploadAndCompress.single('image'), createFieldAttendance);
router.get('/', getFieldAttendances);

export default router;
