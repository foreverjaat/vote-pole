import crypto from 'crypto';
import axios from 'axios';
import { AppError } from './appError.js';
import logger from './logger.js';

/** Cryptographically secure 6-digit OTP */
export const generateOTP = () => crypto.randomInt(100_000, 1_000_000).toString();

/** Send OTP via MSG91 SMS */
export const sendOTP = async (mobile, otp) => {
  if (!process.env.MSG91_AUTH_KEY)  throw new AppError('MSG91_AUTH_KEY not configured', 500);
  if (!process.env.MSG91_WIDGET_ID) throw new AppError('MSG91_WIDGET_ID not configured', 500);

  const cleanMobile = mobile.replace(/^\+91/, '').trim();

  try {
    await axios.post(
      'https://control.msg91.com/api/v5/otp',
      { mobile: `91${cleanMobile}`, otp, widgetId: process.env.MSG91_WIDGET_ID },
      {
        headers: { authkey: process.env.MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
        timeout: 10_000,
      }
    );
    logger.info(`OTP dispatched to 91${cleanMobile}`);
  } catch (err) {
    logger.error(`MSG91 error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError('Failed to send OTP. Please try again.', 502);
  }
};
