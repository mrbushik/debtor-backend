import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/authController";
import { DebtController } from "../controllers/debtController";
import { DepositController } from "../controllers/depositController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/",  async (req: Request, res: Response) => {
  try {
    // const users = await UsersModel.find();
    res.json('good');
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
});
router.get(
  "/deposits/:id",
  authMiddleware,
  DepositController.getAllUserDeposits,
);
router.get("/user-debts/:id", authMiddleware, DebtController.getAllUserDebts);
router.get(
  "/active-debts/:id",
  authMiddleware,
  DebtController.getActiveUserDebts,
);
// router.get('/debt-for-month/:id', DebtController.getDebtsForCurrentMonth)
router.get("/overview/:id", authMiddleware, DebtController.getOverview);
router.get("/analytics/:id", authMiddleware, DebtController.debtsAnalytics);
router.get("/current-debt/:id", authMiddleware, DebtController.getCurrentDebt);
router.get("/refresh", AuthController.updateTokens);
router.get("/logout", AuthController.logout);
router.get("/validate-debtor-token", DebtController.validateDebtorToken);
router.get(
  "/debtors-list/:id",
  authMiddleware,
  DebtController.getMyDebtorsNames,
);
router.get(
  "/all-debtors-tokens/:id",
  authMiddleware,
  DebtController.getAllDebtorsTokens,
);

router.post("/register", AuthController.registration);
router.post("/login", AuthController.login);
router.post("/add-debt", authMiddleware, DebtController.saveDebt);
router.post("/add-deposit/:id", authMiddleware, DepositController.addDeposit);
router.post(
  "/add-debtor-token/:id",
  authMiddleware,
  DebtController.getTokenForDebtor,
);
router.post('/debts-analytics-for-month/:id', DebtController.getDebtsForTargetMonth)

router.patch("/edit-debt/:id", authMiddleware, DebtController.editDebt);
router.patch(
  "/debtor-token/:id",
  authMiddleware,
  DebtController.deleteDebtorToken,
);

router.delete("/debt/:id", authMiddleware, DebtController.deleteDebt);
router.delete("/deposit/:id", authMiddleware, DepositController.deleteDeposit);
export default router;
