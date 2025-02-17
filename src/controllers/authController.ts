import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService/authService";
import { ApiError } from "../exceptions/ApiErrors";
import jwt from "jsonwebtoken";

const authService = new AuthService();

export class AuthController {
  static async registration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      const newUser: any = await authService.signUp(email, password);
      const userData = authService.getTokens(newUser._id);

      if (newUser) {
        res.cookie("refreshToken", userData.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          // path: "/",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.cookie("accessToken", userData.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          // path: "/",
          maxAge: 60 * 60 * 1000,
        });
      }

      res.status(201).json({ newUser, userData });
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
        // path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", userData.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // path: "/",
        maxAge: 60 * 60 * 1000,
      });
      console.log("send tokens");
      res.status(201).json(userData);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async updateTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken: any = req.headers["refreshtoken"];
      if (!refreshToken) {
        throw ApiError.UnauthorizedError();
      }
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.ACCESS_SECRET || "",
      ) as {
        userId: string;
      };
      const userData = authService.getTokens(decoded.id);
      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // domain: ".web.app",
        // path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", userData.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // domain: ".web.app",
        // path: "/",
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json(decoded);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // path: "/",
      });
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // path: "/",
      });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
