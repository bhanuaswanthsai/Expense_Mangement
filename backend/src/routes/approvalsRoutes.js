import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { pendingForUser } from '../controllers/expenseController.js';

const router = Router();

router.use(authMiddleware);
router.get('/pending', pendingForUser);

export default router;
