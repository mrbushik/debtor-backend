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
exports.DebtController = void 0;
const debtModel_1 = require("../models/debtModel");
const debtService_1 = require("../services/debtService/debtService");
const depositService_1 = require("../services/depositService/depositService");
const authService_1 = require("../services/authService/authService");
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiErrors_1 = require("../exceptions/ApiErrors");
const depositModel_1 = require("../models/depositModel");
const debtService = new debtService_1.DebtService();
const depositService = new depositService_1.DepositService();
const authService = new authService_1.AuthService();
class DebtController {
    static getAllUserDebts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                authService.verifyOwnership(req.tokenData.id, id);
                const debtsArr = yield debtModel_1.DebtModel.find({ lenderId: id });
                res.status(200).json(debtsArr);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getCurrentDebt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const currentDebt = yield debtService.getCurrentDebt(id);
                console.log("token info");
                console.log(req.tokenData.id);
                authService.verifyOwnership(req.tokenData.id, (currentDebt === null || currentDebt === void 0 ? void 0 : currentDebt.lenderId) || "");
                res.status(200).json(currentDebt);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getActiveUserDebts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                authService.verifyOwnership(req.tokenData.id, id);
                const activeDebts = yield debtService.getActiveDebts(id);
                res.status(200).json(activeDebts);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getOverview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                authService.verifyOwnership(req.tokenData.id, id);
                const debts = yield debtService.getActiveDebts(id);
                const activeDebts = debts.sort((a, b) => {
                    if (a.withoutDetails && !b.withoutDetails)
                        return 1;
                    if (!a.withoutDetails && b.withoutDetails)
                        return -1;
                    if (!a.debtDate)
                        return 1;
                    if (!b.debtDate)
                        return -1;
                    return new Date(a.debtDate).getTime() + new Date(b.debtDate).getTime();
                });
                const debtAmount = activeDebts.reduce((acc, debt) => acc + debt.refundAmount, 0);
                const roundDigit = (num) => Math.round(num * 100) / 100;
                const depositAmount = yield depositService.getAmountDeposits(id);
                res.status(200).json({
                    activeDebts,
                    depositAmount: roundDigit(depositAmount),
                    debtAmount: roundDigit(debtAmount),
                    total: roundDigit(debtAmount) - roundDigit(depositAmount),
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static debtsAnalytics(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                authService.verifyOwnership(req.tokenData.id, id);
                const allDebts = yield debtService.getAllDebts(id);
                const debtAmount = allDebts.reduce((acc, debt) => acc + debt.refundAmount, 0);
                const roundDigit = (num) => Math.round(num * 100) / 100;
                const totalEarned = allDebts.reduce((acc, debt) => acc - debt.debtAmount, debtAmount);
                res.status(200).json({
                    numberOfDebts: allDebts.length,
                    debtAmount: roundDigit(debtAmount),
                    totalEarned: roundDigit(totalEarned),
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static saveDebt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { debtAmount, debtorName, withoutDetails, lenderId, debtDate, dueDate, debtorInfo, expired, isReturned, refundAmount, } = req.body;
                authService.verifyOwnership(req.tokenData.id, lenderId);
                if (!debtAmount || !debtorName || !lenderId || !refundAmount) {
                    res.status(400).json({ message: "Заполните все обязательные поля" });
                    return;
                }
                const newDebt = yield debtModel_1.DebtModel.create({
                    debtAmount,
                    debtorName,
                    withoutDetails,
                    lenderId,
                    debtDate,
                    dueDate,
                    debtorInfo,
                    expired,
                    isReturned,
                    refundAmount,
                });
                res.status(201).json(newDebt);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static editDebt(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const changes = req.body;
                const debtId = req.params.id;
                const existingDebt = yield debtModel_1.DebtModel.findById(debtId);
                if (!existingDebt) {
                    res.status(404).json({ message: "Запись не найдена" });
                    return;
                }
                authService.verifyOwnership(req.tokenData.id, (existingDebt === null || existingDebt === void 0 ? void 0 : existingDebt.lenderId) || "");
                const updatedDebt = yield debtModel_1.DebtModel.findByIdAndUpdate(debtId, { $set: changes }, { new: true });
                if (!updatedDebt) {
                    res.status(500).json({ message: "Ошибка обновления" });
                    return;
                }
                res.status(200).json(updatedDebt);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static deleteDebt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const existingDebt = yield debtModel_1.DebtModel.findById(id);
                if (!existingDebt) {
                    res.status(404).json({ message: "Долг не найден" });
                    return;
                }
                const deletedDebt = yield debtModel_1.DebtModel.findByIdAndDelete(id);
                if (!deletedDebt) {
                    res.status(500).json({ message: "Ошибка удаления" });
                    return;
                }
                authService.verifyOwnership(req.tokenData.id, (deletedDebt === null || deletedDebt === void 0 ? void 0 : deletedDebt.lenderId) || "");
                res.status(200).json({ message: "Debt removed" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getTokenForDebtor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { debtorName } = req.body;
                const date = new Date().toISOString().split("T")[0];
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 90);
                const expireDate = futureDate.toISOString().split("T")[0];
                authService.verifyOwnership(req.tokenData.id, id || "");
                const user = yield userModel_1.UsersModel.findById(id);
                if (!user) {
                    throw ApiErrors_1.ApiError.BadRequest(`user didn't exist`);
                }
                const currentDebtor = user.debtorsTokens.find((token) => token.debtorName === debtorName);
                if (currentDebtor) {
                    yield userModel_1.UsersModel.findByIdAndUpdate(id, {
                        $pull: { debtorsTokens: { debtorName: debtorName } },
                    });
                }
                const token = jsonwebtoken_1.default.sign({
                    id: user._id,
                    debtorName: debtorName,
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
                }, process.env.JWT_SECRET || "");
                const data = {
                    debtorName: debtorName,
                    token: token,
                    createdDate: date,
                    expireDate: expireDate,
                };
                const updatedUser = yield userModel_1.UsersModel.findByIdAndUpdate({ _id: id }, { $push: { debtorsTokens: data } });
                if (!updatedUser && !updatedUser.debtorsTokens) {
                    throw ApiErrors_1.ApiError.BadRequest(`user update error`);
                }
                const userData = yield userModel_1.UsersModel.findById(id);
                res.status(200).json(userData.debtorsTokens);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteDebtorToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { debtorName } = req.body;
                if (!id && !debtorName) {
                    throw ApiErrors_1.ApiError.BadRequest(`params missing`);
                }
                const user = yield userModel_1.UsersModel.findById(id);
                if (!user) {
                    throw ApiErrors_1.ApiError.BadRequest(`user didn't exist`);
                }
                user.debtorsTokens = user.debtorsTokens.filter((token) => token.debtorName !== debtorName);
                yield user.save();
                res.status(200).json(user.debtorsTokens);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static validateDebtorToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.query.token;
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
                if (!decoded.id || !decoded.debtorName) {
                    throw ApiErrors_1.ApiError.BadRequest("can't validate token");
                }
                const user = yield userModel_1.UsersModel.findById(decoded.id);
                if (!user) {
                    throw ApiErrors_1.ApiError.BadRequest(`user didn't exist`);
                }
                const targetTokenInfo = user.debtorsTokens.find((token) => token.debtorName === decoded.debtorName);
                if (!targetTokenInfo ||
                    !targetTokenInfo.expireDate ||
                    targetTokenInfo.token !== token) {
                    throw ApiErrors_1.ApiError.BadRequest(`something went wrong`);
                }
                const debts = yield debtModel_1.DebtModel.find({
                    lenderId: decoded.id,
                    debtorName: decoded.debtorName,
                    isReturned: false,
                });
                const deposits = yield depositModel_1.DepositModel.find({
                    lenderId: decoded.id,
                    debtorName: decoded.debtorName,
                });
                let debtSum;
                let depositSum;
                let total;
                if (debts && debts.length > 0) {
                    debtSum = debts.reduce((acc, debt) => acc + debt.refundAmount, 0);
                }
                else {
                    debtSum = 0;
                }
                if (deposits && deposits.length > 0) {
                    depositSum = deposits.reduce((acc, deposit) => acc + deposit.depositAmount, 0);
                }
                else {
                    depositSum = 0;
                }
                total = debtSum - depositSum;
                const data = {
                    debts: debts,
                    deposits: deposits,
                    debtSum: debtSum,
                    depositSum: depositSum,
                    total: total,
                    debtorName: decoded.debtorName,
                    expireDate: targetTokenInfo.expireDate,
                };
                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getMyDebtorsNames(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lenderId = req.params.id;
                const uniqueDebtors = yield debtModel_1.DebtModel.aggregate([
                    { $match: { lenderId, isReturned: false } },
                    {
                        $group: {
                            _id: "$debtorName",
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                        },
                    },
                ]).exec();
                const debtorNames = uniqueDebtors.map((item) => item._id);
                res.status(200).json(debtorNames);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllDebtorsTokens(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield userModel_1.UsersModel.findById(id);
                res.status(200).json(user.debtorsTokens);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.DebtController = DebtController;
