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
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const debtController_1 = require("../controllers/debtController");
const depositController_1 = require("../controllers/depositController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const users = await UsersModel.find();
        res.json('good');
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error });
    }
}));
router.get("/deposits/:id", authMiddleware_1.authMiddleware, depositController_1.DepositController.getAllUserDeposits);
router.get("/user-debts/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getAllUserDebts);
router.get("/active-debts/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getActiveUserDebts);
router.get("/overview/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getOverview);
router.get("/analytics/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.debtsAnalytics);
router.get("/current-debt/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getCurrentDebt);
router.get("/refresh", authController_1.AuthController.updateTokens);
router.get("/logout", authController_1.AuthController.logout);
router.get("/validate-debtor-token", debtController_1.DebtController.validateDebtorToken);
router.get("/debtors-list/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getMyDebtorsNames);
router.get("/all-debtors-tokens/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getAllDebtorsTokens);
router.post("/register", authController_1.AuthController.registration);
router.post("/login", authController_1.AuthController.login);
router.post("/add-debt", authMiddleware_1.authMiddleware, debtController_1.DebtController.saveDebt);
router.post("/add-deposit/:id", authMiddleware_1.authMiddleware, depositController_1.DepositController.addDeposit);
router.post("/add-debtor-token/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.getTokenForDebtor);
router.patch("/edit-debt/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.editDebt);
router.patch("/debtor-token/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.deleteDebtorToken);
router.delete("/debt/:id", authMiddleware_1.authMiddleware, debtController_1.DebtController.deleteDebt);
router.delete("/deposit/:id", authMiddleware_1.authMiddleware, depositController_1.DepositController.deleteDeposit);
exports.default = router;
