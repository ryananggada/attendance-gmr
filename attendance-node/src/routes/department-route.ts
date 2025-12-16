import express from 'express';
import {
  createDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from '../controllers/department-controller.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', createDepartment);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);

export default router;
