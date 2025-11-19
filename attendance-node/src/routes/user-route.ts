import express from 'express';
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user-controller.ts';
import { validate } from '../middlewares/validate.ts';
import { createUserSchema } from '../validations/user-schema.ts';

const router = express.Router();

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);

export default router;
