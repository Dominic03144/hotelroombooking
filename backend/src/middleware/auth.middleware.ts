import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Token structure
export interface DecodedToken {
  userId: number;
  role: "user" | "admin" | "owner" | "driver" | "member";
  email?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// ✅ Middleware: Authenticate JWT Token
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    req.user = decoded;
    console.log("✅ Authenticated User:", req.user);
    next();
    return;
  } catch (err) {
    console.error("❌ JWT Error:", err);
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }
};

// ✅ Middleware: Authorize by Role(s)
export const authorizeRoles = (...allowedRoles: DecodedToken["role"][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized - no user information." });
      return;
    }

    console.log("🔐 Role check: user role =", req.user.role);

    if (!allowedRoles.includes(req.user.role)) {
      console.warn("🚫 Access denied for role:", req.user.role);
      res.status(403).json({ error: "Access denied." });
      return;
    }

    next();
    return;
  };
};

// ✅ Shortcut Middleware: Admin Only
export const isAdmin = authorizeRoles("admin");
