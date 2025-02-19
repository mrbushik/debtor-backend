import mongoose from "mongoose";

export interface  DepositModel {
  lenderId: string;
  debtorName: string;
  depositAmount: number;
}

const DepositSchema = new mongoose.Schema({
  lenderId: {
    type: String,
    required: true,
  },
  debtorName: {
    type: String,
    required: true,
  },
  depositAmount: {
    type: Number,
    required: true,
  },
});

export const DepositModel = mongoose.model("Deposits", DepositSchema);
