import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { pendingForUser } from '../controllers/expenseController.js';
import { historyForCurrentUser } from '../controllers/approvalController.js';

const router = Router();

router.use(authMiddleware);
router.get('/pending', pendingForUser);
router.get('/history', historyForCurrentUser);

export default router;
