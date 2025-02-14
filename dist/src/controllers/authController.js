"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService/authService");
const ApiErrors_1 = require("../exceptions/ApiErrors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService = new authService_1.AuthService();
class AuthController {
    static registration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const newUser = yield authService.signUp(email, password);
                if (newUser) {
                    const userData = authService.getTokens(newUser._id);
                    res.cookie("refreshToken", userData.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "lax",
                        path: "/",
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    });
                    res.cookie("accessToken", userData.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "lax",
                        path: "/",
                        maxAge: 60 * 60 * 1000,
                    });
                }
                res.status(201).json(newUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const userData = yield authService.login(email, password);
                res.cookie("refreshToken", userData.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.cookie("accessToken", userData.accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 1000,
                });
                console.log("send tokens");
                res.status(201).json(userData.user);
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static updateTokens(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                console.log(refreshToken);
                if (!refreshToken) {
                    console.log("without tokens");
                    throw ApiErrors_1.ApiError.UnauthorizedError();
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.ACCESS_SECRET || "");
                console.log("decoded token");
                const userData = authService.getTokens(decoded.id);
                res.cookie("refreshToken", userData.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    domain: ".web.app",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.cookie("accessToken", userData.accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    domain: ".web.app",
                    path: "/",
                    maxAge: 60 * 60 * 1000,
                });
                res.status(200).json(decoded);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/",
                });
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/",
                });
                res.status(200).json({ message: "Logged out successfully" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
