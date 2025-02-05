import mongoose from "mongoose";

export interface IDebt extends Document {
  debtAmount: number;
  debtDate?: string;
  dueDate?: string;
  debtorInfo?: string;
  debtorName: string;
  expired?: boolean;
  withoutDetails: boolean;
  isReturned?: boolean;
  refundAmount: number;
  lenderId: string;
  earnings?: number;
}

const DebtSchema = new mongoose.Schema({
  debtAmount: {
    type: Number,
    required: true,
  },
  debtorName: { type: String, required: true },
  withoutDetails: { type: Boolean, required: true },
  refundAmount: { type: Number, required: true },
  lenderId: { type: String, required: true },
  debtDate: {
    type: String,
    required: false,
  },
  dueDate: { type: String, required: false },
  debtorInfo: { type: String, required: false },
  expired: { type: Boolean, required: false },
  isReturned: { type: Boolean, required: false },
  returnedDate: { type: String, required: false },
});

export const DebtModel = mongoose.model("Debts", DebtSchema);
