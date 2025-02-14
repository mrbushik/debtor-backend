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
exports.AuthService = void 0;
const userModel_1 = require("../../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiErrors_1 = require("../../exceptions/ApiErrors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    signUp(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw ApiErrors_1.ApiError.BadRequest(`email or password is empty`);
            }
            const user = yield userModel_1.UsersModel.findOne({ email }).select("+password");
            if (user) {
                throw ApiErrors_1.ApiError.BadRequest(`user already exists`);
            }
            let userData;
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            yield userModel_1.UsersModel.create({
                email,
                password: hashedPassword,
            }).then((user) => (userData = user));
            return userData;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw ApiErrors_1.ApiError.BadRequest(`email or password is empty`);
            }
            const user = yield userModel_1.UsersModel.findOne({ email }).select("+password");
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch || !user) {
                throw ApiErrors_1.ApiError.BadRequest("The username and password are incorrect");
            }
            console.log('password and login is ok');
            const { refreshToken, accessToken } = this.getTokens(user._id);
            console.log('generate tokens');
            return { refreshToken, accessToken, user };
        });
    }
    getTokens(id) {
        const accessToken = jsonwebtoken_1.default.sign({ id: id }, process.env.ACCESS_SECRET || "", {
            expiresIn: "1h",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: id }, process.env.REFRESH_SECRET || "", {
            expiresIn: "30d",
        });
        return { accessToken, refreshToken };
    }
    verifyOwnership(tokenId, id) {
        if (tokenId !== id) {
            throw ApiErrors_1.ApiError.AccessRightsError();
        }
    }
}
exports.AuthService = AuthService;
