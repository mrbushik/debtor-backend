"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DepositSchema = new mongoose_1.default.Schema({
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
exports.DepositModel = mongoose_1.default.model("Deposits", DepositSchema);
