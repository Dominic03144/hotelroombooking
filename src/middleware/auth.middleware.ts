import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  userId: number;
  role: "user" | "admin" | "owner" | "driver" | "member";
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authenticate: RequestHandler = (req, res, next) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  console.log("🔐 Incoming Authorization header:", authHeader);
  console.log("🍪 Incoming Cookie token:", req.cookies?.token);

  if (!token) {
    console.warn("❌ No token found.");
    res.status(401).json({ error: "Missing or invalid token." });
    return; // ✅ explicit return void
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    req.user = decoded;
    console.log("✅ Authenticated user:", decoded);
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token." });
    return; // ✅ explicit return void
  }
};

export const authorizeRoles = (...allowedRoles: DecodedToken["role"][]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn("❌ No user info found on request.");
      res.status(401).json({ error: "Unauthorized — user not authenticated." });
      return; // ✅ return void
    }

    console.log(`🔑 Role check: user role = ${req.user.role}, allowed = ${allowedRoles.join(", ")}`);

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`🚫 Access denied for role: ${req.user.role}`);
      res.status(403).json({ error: "Access denied — insufficient permissions." });
      return; // ✅ return void
    }

    next();
  };
};

export const isAdmin: RequestHandler = authorizeRoles("admin");
