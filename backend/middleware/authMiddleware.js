import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { AppError, catchAsync } from '../utils/appError.js';

/** Verify JWT and attach req.user */
export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Your session has expired. Please log in again.'
      : 'Invalid token. Please log in.';
    throw new AppError(message, 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('Account no longer exists.', 401);
  if (!user.isActive) throw new AppError('Account deactivated. Contact admin.', 403);

  req.user = user;
  next();
});

/** Must be chained AFTER protect */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access only.', 403));
  }
  next();
};

/** Run express-validator checks, return 422 on failure */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages.join('. '), 422));
  }
  next();
};
