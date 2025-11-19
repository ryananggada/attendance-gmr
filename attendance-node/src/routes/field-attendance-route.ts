import express from 'express';
import {
  createFieldAttendance,
  getFieldAttendances,
} from '../controllers/field-attendance-controller.ts';
import { upload } from '../middlewares/multer.ts';

const router = express.Router();

router.post('/', upload.single('image'), createFieldAttendance);
router.get('/', getFieldAttendances);

export default router;
