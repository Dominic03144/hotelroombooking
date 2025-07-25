import { Request, Response, NextFunction } from "express";
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

export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized. Token missing." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      role: string;
      email?: string;
    };

    // ✅ Runtime type guard
    const validRoles = ["user", "admin", "owner", "driver", "member"] as const;
    if (!validRoles.includes(decoded.role as any)) {
      res.status(403).json({ error: "Invalid role." });
      return;
    }

    // ✅ Now safe to assign
    req.user = {
      userId: decoded.userId,
      role: decoded.role as DecodedToken["role"],
      email: decoded.email,
    };

    if (req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden. Admins only." });
      return;
    }

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
