import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { AppError, catchAsync } from '../utils/appError.js';
import { generateOTP, sendOTP } from '../utils/sendOtp.js';
import logger from '../utils/logger.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber,
        mobile: user.mobile,
      },
    },
  });
};

/* REGISTER */
export const register = catchAsync(async (req, res) => {
  const { name, email, password, mobile, enrollmentNumber } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { enrollmentNumber }, { mobile }] });
  if (exists) {
    const msg = exists.email === email
      ? 'An account with this email already exists.'
      : exists.enrollmentNumber === enrollmentNumber
        ? 'Enrollment number is already registered.'
        : 'Mobile number is already registered.';
    throw new AppError(msg, 409);
  }

  const user = await User.create({ name, email, password, mobile, enrollmentNumber, role: 'student' });
  logger.info(`New student registered: ${email}`);
  createSendToken(user, 201, res);
});

/* LOGIN */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account is deactivated. Contact admin.', 403);
  }

  logger.info(`User logged in: ${email}`);
  createSendToken(user, 200, res);
});

/* FORGOT PASSWORD — sends OTP via MSG91 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { mobile } = req.body;
  const user = await User.findOne({ mobile });

  // Security: always return 200 (don't reveal whether mobile exists)
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If that mobile is registered, an OTP has been sent.',
    });
  }

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await User.findByIdAndUpdate(user._id, { otp: otpHash, otpExpire });

  try {
    await sendOTP(mobile, otp);
    logger.info(`OTP sent to mobile: ${mobile}`);
  } catch (err) {
    await User.findByIdAndUpdate(user._id, { otp: undefined, otpExpire: undefined });
    throw new AppError('Failed to send OTP. Please try again.', 502);
  }

  res.status(200).json({
    status: 'success',
    message: 'If that mobile is registered, an OTP has been sent.',
  });
});

/* RESET PASSWORD */
export const resetPassword = catchAsync(async (req, res) => {
  const { mobile, otp, newPassword } = req.body;
  const user = await User.findOne({ mobile }).select('+otp +otpExpire');

  if (!user || !user.otp || !user.otpExpire) {
    throw new AppError('No password reset was requested for this number.', 400);
  }
  if (user.otpExpire < Date.now()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) throw new AppError('Incorrect OTP.', 400);

  user.password  = newPassword;
  user.otp       = undefined;
  user.otpExpire = undefined;
  await user.save();

  logger.info(`Password reset for mobile: ${mobile}`);
  res.status(200).json({ status: 'success', message: 'Password reset successful. Please log in.' });
});

/* GET ME */
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ status: 'success', data: { user } });
});

/* CHANGE PASSWORD (logged in) */
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
});
