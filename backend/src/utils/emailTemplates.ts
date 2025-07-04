/**
 * ✅ Utility to generate a 6-digit verification or reset code.
 */
export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * ✅ Email template for verification using a 6-digit code.
 */
export function generateVerificationEmail(name: string, code: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px;">
        <h2 style="color: #007bff;">Welcome, ${name}!</h2>
        <p>Use the code below to verify your email address:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; background: #eef3fb; padding: 10px 20px; border-radius: 5px; letter-spacing: 4px; display: inline-block;">
          ${code}
        </div>
        <p style="margin-top: 20px;">This code will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
        <div style="margin-top: 30px; font-size: 0.85rem; color: #666;">&copy; ${new Date().getFullYear()} Hotel Booking System</div>
      </div>
    </div>
  `;
}

/**
 * ✅ Email template for password reset using a 6-digit code.
 */
export function generatePasswordResetEmail(name: string, code: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #fdf5f5; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px;">
        <h2 style="color: #dc3545;">Hello, ${name}</h2>
        <p>You requested to reset your password. Use the code below to continue:</p>
        <div style="font-size: 24px; font-weight: bold; color: #dc3545; background: #fcebea; padding: 10px 20px; border-radius: 5px; letter-spacing: 4px; display: inline-block;">
          ${code}
        </div>
        <p style="margin-top: 20px;">This code will expire in 10 minutes.</p>
        <p>If you didn’t request this, please ignore the email.</p>
        <div style="margin-top: 30px; font-size: 0.85rem; color: #666;">&copy; ${new Date().getFullYear()} Hotel Booking System</div>
      </div>
    </div>
  `;
}
