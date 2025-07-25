/**
 * This is the canonical User type for your backend.
 * It matches what you SELECT or RETURN in your DB,
 * AND the shape you encode in your JWT.
 */

export interface User {
  userId: number; // ✅ Primary key
  email: string;  // ✅ Required for login and identity

  firstname: string; // ✅ Required field
  lastname: string;  // ✅ Required field

  contactPhone: string | null;  // ✅ Optional, can be null in DB
  address: string | null;       // ✅ Optional, can be null in DB

  profileImageUrl: string | null; // ✅ Optional, can be null in DB
}
