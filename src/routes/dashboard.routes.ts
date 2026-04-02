import { Router } from 'express';
import { getSummary, getCategoryTotals, getRecentActivity } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);
router.use(requireRole(['VIEWER', 'ANALYST', 'ADMIN'])); // All roles can view dashboard

router.get('/summary', getSummary);
router.get('/category-totals', getCategoryTotals);
router.get('/recent-activity', getRecentActivity);

export default router;
