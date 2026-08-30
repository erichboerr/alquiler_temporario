import { Router } from 'express';
import { login, verify } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// POST /api/auth/login
// loginLimiter va PRIMERO: si la IP superó el límite de intentos,
// la request ni siquiera llega al controller.
router.post('/login', loginLimiter, login);

// GET /api/auth/verify
// verifyToken valida el JWT y carga req.user antes de llegar a "verify".
// Se usa para revalidar la sesión al recargar el frontend.
router.get('/verify', verifyToken, verify);



export default router;