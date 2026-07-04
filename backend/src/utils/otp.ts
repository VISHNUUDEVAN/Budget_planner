import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit numeric OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash an OTP using bcrypt (same as password hashing)
 */
export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify a raw OTP against a stored bcrypt hash
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Stub email sender — logs OTP to console.
 * Replace this with Nodemailer/SendGrid for production.
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  console.log(`\n📧 [EMAIL STUB] OTP for ${email}: ${otp}\n`);
  // TODO: replace with real email delivery:
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ to: email, subject: 'Your OTP', text: `Your OTP is ${otp}` });
}
