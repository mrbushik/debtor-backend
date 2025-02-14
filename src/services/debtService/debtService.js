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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtService = void 0;
const debtModel_1 = require("../../models/debtModel");
class DebtService {
    getActiveDebts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield debtModel_1.DebtModel.find({ lenderId: userId, isReturned: false });
        });
    }
    getAllDebts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield debtModel_1.DebtModel.find({ lenderId: userId });
        });
    }
    getCurrentDebt(debtId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield debtModel_1.DebtModel.findById(debtId);
        });
    }
}
exports.DebtService = DebtService;
