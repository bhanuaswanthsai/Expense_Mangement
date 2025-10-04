import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { createUser, getUsers, updateUser } from '../controllers/userController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole('Admin'), createUser);
router.get('/', getUsers);
router.put('/:id', requireRole('Admin'), updateUser);

export default router;
