import { Router } from 'express';
import authRoutes from '@/routes/authRoutes';
import taskRoutes from '@/routes/taskRoutes';

import { protect } from '@/middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', protect, taskRoutes);

export default router;