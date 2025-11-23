import express from 'express';
import {
  checkIn,
  fieldCheckIn,
  fieldCheckOut,
  checkOut,
  submitLeave,
  getAttendances,
  getSingleAttendance,
  submitEarlyLeave,
} from '../controllers/attendance-controller.ts';
import { upload } from '../middlewares/multer.ts';
import { validate } from '../middlewares/validate.ts';
import {
  createAttendanceSchema,
  leaveSchema,
  earlyLeaveSchema,
} from '../validations/attendance-schema.ts';

const router = express.Router();

router.get('/', getAttendances);
router.post(
  '/check-in',
  upload.single('image'),
  validate(createAttendanceSchema),
  checkIn,
);
router.post(
  '/field-check-in',
  upload.single('image'),
  validate(createAttendanceSchema),
  fieldCheckIn,
);
router.post(
  '/field-check-out',
  upload.single('image'),
  validate(createAttendanceSchema),
  fieldCheckOut,
);
router.post(
  '/check-out',
  upload.single('image'),
  validate(createAttendanceSchema),
  checkOut,
);
router.post('/leave', validate(leaveSchema), submitLeave);
router.post('/early-leave', validate(earlyLeaveSchema), submitEarlyLeave);
router.get('/user/:userId', getSingleAttendance);

export default router;
