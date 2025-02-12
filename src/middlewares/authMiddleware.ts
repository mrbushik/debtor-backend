import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../exceptions/ApiErrors";

declare global {
  namespace Express {
    interface Request {
      tokenData?: any;
    }
  }
}

interface AuthError extends Error {
  status?: number;
}

function asyncMiddleware(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: AuthError) => next(error));
  };
}

export const authMiddleware = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw ApiError.UnauthorizedError();
      }
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET || "") as {
        userId: string;
      };
      req.tokenData = decoded;
      next();
    } catch (error) {
      throw ApiError.UnauthorizedError();
    }
  },
);
