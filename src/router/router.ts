import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/authController";
import { DebtController } from "../controllers/debtController";
import { DepositController } from "../controllers/depositController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware,async (req: Request, res: Response) => {
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
router.get('/deposits/:id', authMiddleware, DepositController.getAllUserDeposits)
router.get('/user-debts/:id',authMiddleware, DebtController.getAllUserDebts)
router.get('/active-debts/:id',authMiddleware, DebtController.getActiveUserDebts)
router.get('/overview/:id', DebtController.getOverview)
router.get('/analytics/:id', DebtController.debtsAnalytics)
router.get('/current-debt/:id', DebtController.getCurrentDebt)

router.post("/register", AuthController.registration);
router.post("/login", AuthController.login);
router.post("/add-debt", DebtController.saveDebt);
router.post("/add-deposit", DepositController.addDeposit);

router.patch("/edit-debt/:id", DebtController.editDebt);

router.delete("/debt/:id", DebtController.deleteDebt);
router.delete("/deposit/:id", DepositController.deleteDeposit);
export default router;
