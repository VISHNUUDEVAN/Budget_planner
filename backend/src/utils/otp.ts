import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

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
 * Send OTP via SMTP if configured, otherwise logs OTP to console.
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Check if SMTP configurations are empty or default placeholders
  const isPlaceholder = 
    !host || !port || !user || !pass ||
    host.includes('example.com') ||
    user.includes('your-email') ||
    pass.includes('your-app-password');

  if (isPlaceholder) {
    console.log(`\n📧 [EMAIL STUB] OTP for ${email}: ${otp} (SMTP configuration is missing or placeholder)\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: {
        user: user,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: `"Smart Finance" <${user}>`,
      to: email,
      subject: 'Your Password Reset OTP - Smart Finance',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Verification</h2>
          <p>You requested to reset your password for your Smart Finance account. Use the following 6-digit One-Time Password (OTP) to complete the reset process:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #f8fafc; border-radius: 6px; text-align: center; margin: 20px 0; color: #1e293b; border: 1px solid #cbd5e1;">
            ${otp}
          </div>
          <p>This code is valid for ${process.env.OTP_EXPIRES_MINUTES || 10} minutes. If you did not request this, please ignore this email or contact support.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated email, please do not reply.</p>
        </div>
      `,
    });

    console.log(`📧 OTP email successfully sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email via SMTP:', error);
    console.log(`\n📧 [EMAIL FALLBACK] OTP for ${email}: ${otp} (SMTP delivery failed)\n`);
  }
}
