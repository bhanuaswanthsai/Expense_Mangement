import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { createRule, getRules, updateRule } from '../controllers/approvalController.js';
import { pendingForUser } from '../controllers/expenseController.js';

const router = Router();

router.use(authMiddleware);
router.post('/', requireRole('Admin'), createRule);
router.get('/', getRules);
router.put('/:id', requireRole('Admin'), updateRule);
// Pending approvals for current user
router.get('/pending', pendingForUser);

export default router;
