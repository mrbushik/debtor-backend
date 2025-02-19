import { UsersModel } from "../../models/userModel";
import bcrypt from "bcryptjs";
import { ApiError } from "../../exceptions/ApiErrors";
import jwt from "jsonwebtoken";
import {Response} from "express";

export class AuthService {
  async signUp(email: string, password: string) {
    if (!email || !password) {
      throw ApiError.BadRequest(`email or password is empty`);
    }
    const user = await UsersModel.findOne({ email }).select("+password");

    if (user) {
      throw ApiError.BadRequest(`user already exists`);
    }

    let userData;

    const hashedPassword = await bcrypt.hash(password, 10);
    await UsersModel.create({
      email,
      password: hashedPassword,
    }).then((user) => (userData = user));
    return userData;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw ApiError.BadRequest(`email or password is empty`);
    }

    const user: any = await UsersModel.findOne({ email }).select("+password");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || !user) {
      throw ApiError.BadRequest("The username and password are incorrect");
    }
    console.log('password and login is ok')

    const { refreshToken, accessToken } = this.getTokens(user._id);
    console.log('generate tokens')
    return { refreshToken, accessToken, user };
  }

  getTokens(id: string) {
    const accessToken = jwt.sign({ id: id }, process.env.ACCESS_SECRET || "", {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: id },
      process.env.REFRESH_SECRET || "",
      {
        expiresIn: "30d",
      },
    );
    return { accessToken, refreshToken };
  }

  verifyOwnership(tokenId: string, id?: string) {
    if (tokenId !== id) {
      throw ApiError.AccessRightsError();
    }
  }

    sendTokens(res: Response, userData: any) {
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
  }
}
