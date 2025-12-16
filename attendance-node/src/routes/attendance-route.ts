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
} from '../controllers/attendance-controller.js';
import { uploadAndCompress } from '../middlewares/multer.js';
import { validate } from '../middlewares/validate.js';
import {
  createAttendanceSchema,
  leaveSchema,
  earlyLeaveSchema,
} from '../validations/attendance-schema.js';

const router = express.Router();

router.get('/', getAttendances);
router.post(
  '/check-in',
  uploadAndCompress.single('image'),
  validate(createAttendanceSchema),
  checkIn,
);
router.post(
  '/field-check-in',
  uploadAndCompress.single('image'),
  validate(createAttendanceSchema),
  fieldCheckIn,
);
router.post(
  '/field-check-out',
  uploadAndCompress.single('image'),
  validate(createAttendanceSchema),
  fieldCheckOut,
);
router.post(
  '/check-out',
  uploadAndCompress.single('image'),
  validate(createAttendanceSchema),
  checkOut,
);
router.post('/leave', validate(leaveSchema), submitLeave);
router.post('/early-leave', validate(earlyLeaveSchema), submitEarlyLeave);
router.get('/user/:userId', getSingleAttendance);

export default router;
