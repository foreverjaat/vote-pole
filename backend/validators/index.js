import { body, param } from 'express-validator';

/* ── Auth ──────────────────────────────────────────────────── */
export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  ,
  body('mobile').trim().notEmpty().withMessage('Mobile is required').matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
  body('enrollmentNumber').trim().notEmpty().withMessage('Enrollment number is required'),
];

export const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('mobile').trim().notEmpty().withMessage('Mobile is required').matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
];

export const validateResetPassword = [
  body('mobile').trim().notEmpty().withMessage('Mobile is required').matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
  body('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    ,
];

/* ── Election ──────────────────────────────────────────────── */
export const validateCreateElection = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }).withMessage('Title max 120 chars'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
  body('roles').isArray({ min: 1 }).withMessage('At least one role is required'),
  body('roles.*.name').trim().notEmpty().withMessage('Each role must have a name'),
];

/* ── Vote ──────────────────────────────────────────────────── */
export const validateCastVote = [
  body('candidateId').notEmpty().withMessage('candidateId is required').isMongoId().withMessage('Invalid candidateId'),
  body('electionId').notEmpty().withMessage('electionId is required').isMongoId().withMessage('Invalid electionId'),
  body('role').trim().notEmpty().withMessage('role is required'),
];

/* ── Shared ────────────────────────────────────────────────── */
export const validateMongoId = (field = 'id') => [
  param(field).isMongoId().withMessage(`Invalid ${field}`),
];
