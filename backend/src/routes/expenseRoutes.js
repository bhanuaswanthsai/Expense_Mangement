import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { createExpense, getExpenses, getExpenseById, approveExpense, rejectExpense, pendingForUser } from '../controllers/expenseController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getExpenses);
router.get('/pending', pendingForUser);
router.get('/:id', getExpenseById);
router.post('/', requireRole('Employee', 'Admin'), createExpense);
router.put('/:id/approve', requireRole('Manager', 'Admin'), approveExpense);
router.put('/:id/reject', requireRole('Manager', 'Admin'), rejectExpense);

export default router;
