import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/authController";
import { DebtController } from "../controllers/debtController";
import { DepositController } from "../controllers/depositController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.tokenData;
    if (!user) {
      res.json("bad");
    }
    // const users = await UsersModel.find();
    res.json(user);
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
router.get("/overview/:id", authMiddleware, DebtController.getOverview);
router.get("/analytics/:id", authMiddleware, DebtController.debtsAnalytics);
router.get("/current-debt/:id", authMiddleware, DebtController.getCurrentDebt);
router.get("/refresh", AuthController.updateTokens);
router.get("/logout", AuthController.logout)

router.post("/register", AuthController.registration);
router.post("/login", AuthController.login);
router.post("/add-debt", authMiddleware, DebtController.saveDebt);
router.post("/add-deposit", authMiddleware, DepositController.addDeposit);

router.patch("/edit-debt/:id", authMiddleware, DebtController.editDebt);

router.delete("/debt/:id", authMiddleware, DebtController.deleteDebt);
router.delete("/deposit/:id", authMiddleware, DepositController.deleteDeposit);
export default router;
