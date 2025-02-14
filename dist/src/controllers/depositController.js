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
exports.DepositController = void 0;
const depositModel_1 = require("../models/depositModel");
const authService_1 = require("../services/authService/authService");
const authService = new authService_1.AuthService();
class DepositController {
    static addDeposit(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lenderId, debtorName, depositAmount } = req.body;
                authService.verifyOwnership(req.tokenData.id, lenderId);
                if (!lenderId || !debtorName || !depositAmount) {
                    res.status(400).json({ message: "Заполните все обязательные поля" });
                    return;
                }
                const deposit = yield depositModel_1.DepositModel.create({
                    lenderId,
                    debtorName,
                    depositAmount,
                });
                res.status(201).json(deposit);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllUserDeposits(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                authService.verifyOwnership(req.tokenData.id, id);
                const userDeposits = yield depositModel_1.DepositModel.find({ lenderId: id });
                res.status(200).json(userDeposits);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteDeposit(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const existingDeposit = yield depositModel_1.DepositModel.findById(id);
                if (!existingDeposit) {
                    res.status(404).json({ message: "Запись не найдена" });
                    return;
                }
                const deletedDeposit = yield depositModel_1.DepositModel.findByIdAndDelete(id);
                if (!deletedDeposit) {
                    res.status(500).json({ message: "Ошибка удаления" });
                    return;
                }
                authService.verifyOwnership(req.tokenData.id, (deletedDeposit === null || deletedDeposit === void 0 ? void 0 : deletedDeposit.lenderId) || "");
                res.status(200).json({ message: "Deposit removed" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.DepositController = DepositController;
