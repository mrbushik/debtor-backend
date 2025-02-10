import { NextFunction, Request, Response } from "express";
import { DebtModel, IDebt } from "../models/debtModel";
import { DebtService } from "../services/debtService/debtService";
import { DepositService } from "../services/depositService/depositService";
import { AuthService } from "../services/authService/authService";

const debtService = new DebtService();
const depositService = new DepositService();
const authService = new AuthService();

export class DebtController {
  static async getAllUserDebts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      authService.verifyOwnership(req.tokenData.id, id);
      const debtsArr = await DebtModel.find({ lenderId: id });
      res.status(200).json(debtsArr);
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentDebt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const currentDebt = await debtService.getCurrentDebt(id);
      console.log('token info')
      console.log(req.tokenData.id)
      authService.verifyOwnership(
        req.tokenData.id,
        currentDebt?.lenderId || "",
      );
      res.status(200).json(currentDebt);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveUserDebts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      authService.verifyOwnership(req.tokenData.id, id);
      const activeDebts = await debtService.getActiveDebts(id);
      res.status(200).json(activeDebts);
    } catch (error) {
      next(error);
    }
  }

  static async getOverview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      authService.verifyOwnership(req.tokenData.id, id);
      const debts: IDebt[] = await debtService.getActiveDebts(id);
      const activeDebts = debts.sort((a, b) => {
        if (a.withoutDetails && !b.withoutDetails) return 1;
        if (!a.withoutDetails && b.withoutDetails) return -1;
        if (!a.debtDate) return 1;
        if (!b.debtDate) return -1;

        return new Date(a.debtDate).getTime() + new Date(b.debtDate).getTime();
      });
      const debtAmount = activeDebts.reduce(
        (acc, debt) => acc + debt.refundAmount,
        0,
      );

      const roundDigit = (num: number) => Math.round(num * 100) / 100;

      const depositAmount = await depositService.getAmountDeposits(id);
      res.status(200).json({
        activeDebts,
        depositAmount: roundDigit(depositAmount),
        debtAmount: roundDigit(debtAmount),
        total: roundDigit(debtAmount) - roundDigit(depositAmount),
      });
    } catch (error) {
      next(error);
    }
  }

  static async debtsAnalytics(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      authService.verifyOwnership(req.tokenData.id, id);
      const allDebts: IDebt[] = await debtService.getAllDebts(id);
      const debtAmount = allDebts.reduce(
        (acc, debt) => acc + debt.refundAmount,
        0,
      );

      const roundDigit = (num: number) => Math.round(num * 100) / 100;

      const totalEarned = allDebts.reduce(
        (acc, debt) => acc - debt.debtAmount,
        debtAmount,
      );

      res.status(200).json({
        numberOfDebts: allDebts.length,
        debtAmount: roundDigit(debtAmount),
        totalEarned: roundDigit(totalEarned),
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveDebt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
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
      } = req.body;

      authService.verifyOwnership(req.tokenData.id, lenderId);

      if (!debtAmount || !debtorName || !lenderId || !refundAmount) {
        res.status(400).json({ message: "Заполните все обязательные поля" });
        return;
      }

      const newDebt = await DebtModel.create({
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
    } catch (error) {
      next(error);
    }
  }

  static async editDebt(req: Request, res: Response): Promise<void> {
    try {
      const changes = req.body;
      const debtId = req.params.id;
      const existingDebt: IDebt | null = await DebtModel.findById(debtId);

      if (!existingDebt) {
        res.status(404).json({ message: "Запись не найдена" });
        return;
      }

      authService.verifyOwnership(
        req.tokenData.id,
        existingDebt?.lenderId || "",
      );

      const updatedDebt = await DebtModel.findByIdAndUpdate(
        debtId,
        { $set: changes },
        { new: true },
      );

      if (!updatedDebt) {
        res.status(500).json({ message: "Ошибка обновления" });
        return;
      }

      res.status(200).json(updatedDebt);
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteDebt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const existingDebt = await DebtModel.findById(id);

      if (!existingDebt) {
        res.status(404).json({ message: "Долг не найден" });
        return;
      }

      const deletedDebt: IDebt | null = await DebtModel.findByIdAndDelete(id);

      if (!deletedDebt) {
        res.status(500).json({ message: "Ошибка удаления" });
        return;
      }

      authService.verifyOwnership(
        req.tokenData.id,
        deletedDebt?.lenderId || "",
      );

      res.status(200).json({ message: "Debt removed" });
    } catch (error) {
      next(error);
    }
  }
}
