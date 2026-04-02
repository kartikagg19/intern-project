import { Router } from 'express';
import { register, login, getUsers, updateUserRole } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, updateRoleSchema } from '../schemas/user.schema';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes (Admin only)
router.get('/', authenticate, requireRole(['ADMIN']), getUsers);
router.put('/:id/role', authenticate, requireRole(['ADMIN']), validate(updateRoleSchema), updateUserRole);

export default router;
