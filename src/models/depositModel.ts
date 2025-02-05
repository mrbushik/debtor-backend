import mongoose from "mongoose";

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
