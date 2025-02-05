import { NextFunction, Request, Response } from "express";
import { DepositModel } from "../models/depositModel";
import { AuthService } from "../services/authService/authService";
import { IDebt } from "../models/debtModel";

const authService = new AuthService();
export class DepositController {
  static async addDeposit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { lenderId, debtorName, depositAmount } = req.body;

      authService.verifyOwnership(req.tokenData.id, lenderId);

      if (!lenderId || !debtorName || !depositAmount) {
        res.status(400).json({ message: "Заполните все обязательные поля" });
        return;
      }

      const deposit = await DepositModel.create({
        lenderId,
        debtorName,
        depositAmount,
      });

      res.status(201).json(deposit);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUserDeposits(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      authService.verifyOwnership(req.tokenData.id, id);
      const userDeposits = await DepositModel.find({ lenderId: id });
      res.status(200).json(userDeposits);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDeposit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const existingDeposit = await DepositModel.findById(id);

      if (!existingDeposit) {
        res.status(404).json({ message: "Запись не найдена" });
        return;
      }

      const deletedDeposit: IDebt | null =
        await DepositModel.findByIdAndDelete(id);

      if (!deletedDeposit) {
        res.status(500).json({ message: "Ошибка удаления" });
        return;
      }

      authService.verifyOwnership(
        req.tokenData.id,
        deletedDeposit?.lenderId || "",
      );

      res.status(200).json({ message: "Deposit removed" });
    } catch (error) {
      next(error);
    }
  }
}
