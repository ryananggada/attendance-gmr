import express from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user-controller.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema } from '../validations/user-schema.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
