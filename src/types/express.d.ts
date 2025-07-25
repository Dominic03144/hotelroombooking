// src/types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;    // consistent userId from JWT
        email?: string;
        role?: string;
        // add any other fields you include in JWT
      };
    }
  }
}

export {};
