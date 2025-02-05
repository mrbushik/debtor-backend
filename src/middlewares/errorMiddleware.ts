import { Request, Response, NextFunction } from "express";
import { ApiError } from "../exceptions/ApiErrors";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, errors: err.errors });
    return;
  }
  console.log("error middleware");
  res.status(500).json({ message: "An unexpected error occurred" });
};
