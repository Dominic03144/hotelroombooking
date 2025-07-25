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
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #007bff;">Welcome, ${name}!</h2>
            <p style="font-size: 16px; color: #333;">Use the code below to verify your email address:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007bff; background: #eef3fb; padding: 12px 20px; border-radius: 5px; letter-spacing: 4px; display: inline-block;">
              ${code}
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>
            <p style="font-size: 14px; color: #777;">If you didn’t request this email, feel free to ignore it.</p>
            <div style="margin-top: 30px; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Hotel Booking System</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * ✅ Email template for password reset using a 6-digit code.
 */
export function generatePasswordResetEmail(name: string, code: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin: 0; padding: 0; background-color: #fdf5f5;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #dc3545;">Hello, ${name}</h2>
            <p style="font-size: 16px; color: #333;">You requested to reset your password. Use the code below to continue:</p>
            <div style="font-size: 24px; font-weight: bold; color: #dc3545; background: #fcebea; padding: 12px 20px; border-radius: 5px; letter-spacing: 4px; display: inline-block;">
              ${code}
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #555;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this message.</p>
            <div style="margin-top: 30px; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Hotel Booking System</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
