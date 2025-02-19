import mongoose from "mongoose";

export interface UserModel {
  _id: string;
  email: string;
  password: string;
  debtorsTokens?: DebtorTokenModel[];
}

export interface DebtorTokenModel {
  debtorName: string;
  token: string;
  createdDate: string;
  expireDate: string;
}

const UsersSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  debtorsTokens: { type: [], default: [] },
});

export const UsersModel = mongoose.model("Users", UsersSchema);
