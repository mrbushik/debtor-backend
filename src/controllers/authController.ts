import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService/authService";
import { ApiError } from "../exceptions/ApiErrors";

const authService = new AuthService();

export class AuthController {
  static async registration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      const userData = await authService.signUp(email, password);
      res.status(201).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const userData = await authService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", userData.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 1000,
      });

      res.status(201).json(userData.user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
