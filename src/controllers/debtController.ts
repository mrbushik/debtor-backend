import { NextFunction, Request, Response } from "express";
import { DebtModel, IDebt } from "../models/debtModel";
import { DebtService } from "../services/debtService/debtService";
import { DepositService } from "../services/depositService/depositService";
import { AuthService } from "../services/authService/authService";
import { UsersModel } from "../models/userModel";
import jwt from "jsonwebtoken";
import { ApiError } from "../exceptions/ApiErrors";
import { DepositModel } from "../models/depositModel";

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
      console.log("token info");
      console.log(req.tokenData.id);
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

  static async getTokenForDebtor(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { debtorName } = req.body;
      const date = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const expireDate = futureDate.toISOString().split("T")[0];

      authService.verifyOwnership(req.tokenData.id, id || "");

      const user: any = await UsersModel.findById(id);

      if (!user) {
        throw ApiError.BadRequest(`user didn't exist`);
      }

      const currentDebtor: any = user.debtorsTokens.find(
        (token: any) => token.debtorName === debtorName,
      );

      if (currentDebtor) {
        await UsersModel.findByIdAndUpdate(id, {
          $pull: { debtorsTokens: { debtorName: debtorName } },
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          debtorName: debtorName,
          createdDate: date,
          expireDate: expireDate,
        },
        process.env.JWT_SECRET || "",
        { expiresIn: "90d" },
      );

      const data = {
        debtorName: debtorName,
        token: token,
        createdDate: date,
        expireDate: expireDate,
      };

      const updatedUser: any = await UsersModel.findByIdAndUpdate(
        { _id: id },
        { $push: { debtorsTokens: data } },
      );

      if (!updatedUser && !updatedUser.debtorsTokens) {
        throw ApiError.BadRequest(`user update error`);
      }

      const userData: any = await UsersModel.findById(id);

      res.status(200).json(userData.debtorsTokens);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDebtorToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { debtorName } = req.body;

      if (!id && !debtorName) {
        throw ApiError.BadRequest(`params missing`);
      }
      const user: any = await UsersModel.findById(id);
      if (!user) {
        throw ApiError.BadRequest(`user didn't exist`);
      }

      user.debtorsTokens = user.debtorsTokens.filter(
        (token: any) => token.debtorName !== debtorName,
      );

      await user.save();

      res.status(200).json(user.debtorsTokens);
    } catch (error) {
      next(error);
    }
  }

  static async validateDebtorToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const token: any = req.query.token;
      const decoded: any = jwt.verify(
        token,
        process.env.ACCESS_SECRET || "",
      ) as {
        userId: string;
      };

      if (!decoded.id || !decoded.debtorName) {
        throw ApiError.BadRequest("can't validate token");
      }

      const debts: any = await DebtModel.find({
        lenderId: decoded.id,
        debtorName: decoded.debtorName,
        isReturned: false,
      });

      const deposits: any = await DepositModel.find({
        lenderId: decoded.id,
        debtorName: decoded.debtorName,
      });

      let debtSum;
      let depositSum;
      let total;

      if (debts && debts.length > 0) {
        debtSum = debts.reduce(
          (acc: number, debt: any) => acc + debt.refundAmount,
          0,
        );
      } else {
        debtSum = 0;
      }

      if (deposits && deposits.length > 0) {
        depositSum = deposits.reduce(
          (acc: number, deposit: any) => acc + deposit.depositAmount,
          0,
        );
      } else {
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
      };
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getMyDebtorsNames(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const lenderId = req.params.id;
      const uniqueDebtors = await DebtModel.aggregate([
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

      const debtorNames = uniqueDebtors.map((item: any) => item._id);

      res.status(200).json(debtorNames);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDebtorsTokens(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const user: any = await UsersModel.findById(id);
      res.status(200).json(user.debtorsTokens);
    } catch (error) {
      next(error);
    }
  }
}
