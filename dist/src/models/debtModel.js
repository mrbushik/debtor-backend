"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DebtSchema = new mongoose_1.default.Schema({
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
exports.DebtModel = mongoose_1.default.model("Debts", DebtSchema);
