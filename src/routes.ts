import { Router } from 'express';
import chat from './chat/route';

const router = Router();
router.use('/chat', chat);

export default router;
