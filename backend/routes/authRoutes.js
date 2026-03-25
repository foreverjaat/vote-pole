import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, forgotPassword, resetPassword, getMe, changePassword,
} from '../controllers/authController.js';
import {
  validateRegister, validateLogin, validateForgotPassword, validateResetPassword,
} from '../validators/index.js';
import { validate, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { status: 'fail', message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',        authLimiter, validateRegister,       validate, register);
router.post('/login',           authLimiter, validateLogin,          validate, login);
router.post('/forgot-password', authLimiter, validateForgotPassword, validate, forgotPassword);
router.post('/reset-password',  authLimiter, validateResetPassword,  validate, resetPassword);
router.get('/me',               protect, getMe);
router.put('/change-password',  protect, validate, changePassword);

export default router;
