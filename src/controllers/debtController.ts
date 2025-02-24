import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import {
  ChartData,
  DebtModel,
  IDebt,
  MonthlyRefundsModel,
} from "../models/debtModel";
import { DepositModel } from "../models/depositModel";
import { DebtorTokenModel, UserModel, UsersModel } from "../models/userModel";

import { DebtService } from "../services/debtService/debtService";
import { DepositService } from "../services/depositService/depositService";
import { AuthService } from "../services/authService/authService";

import { ApiError } from "../exceptions/ApiErrors";

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
      const { sortBy, order } = req.query as {
        sortBy?: string;
        order?: "asc" | "desc";
      };

      if (!id) {
        throw ApiError.BadRequest("Missing user ID");
      }
      console.log("id");
      console.log(id);
      console.log("req.tokenData.id");
      console.log(req.tokenData.id);
      authService.verifyOwnership(req.tokenData.id, id);

      let debtsArr;
      if (!sortBy && !order) {
        debtsArr = await DebtModel.find({ lenderId: id });
      } else {
        const sortOrder = order === "asc" ? 1 : -1;
        debtsArr = await DebtModel.find({ lenderId: id }).sort({
          ["refundAmount"]: sortOrder,
        });
      }
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
        res.status(400).json({ message: "Fill in all required fields" });
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
        res.status(404).json({ message: "The record was not found" });
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
        res.status(500).json({ message: "Updating error" });
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
        res.status(404).json({ message: "Debt not found" });
        return;
      }

      const deletedDebt: IDebt | null = await DebtModel.findByIdAndDelete(id);

      if (!deletedDebt) {
        res.status(500).json({ message: "Deletion error" });
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

      const user: UserModel | null = await UsersModel.findById(id);

      if (!user) {
        throw ApiError.BadRequest(`user didn't exist`);
      }

      const currentDebtor: DebtorTokenModel | undefined =
        user.debtorsTokens!.find(
          (token: DebtorTokenModel) => token.debtorName === debtorName,
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
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
        },
        process.env.JWT_SECRET || "",
      );

      const data = {
        debtorName: debtorName,
        token: token,
        createdDate: date,
        expireDate: expireDate,
      };

      const updatedUser: UserModel | null = await UsersModel.findByIdAndUpdate(
        { _id: id },
        { $push: { debtorsTokens: data } },
      );

      if (!updatedUser) {
        throw ApiError.BadRequest(`user update error`);
      }

      const userData: UserModel | null = await UsersModel.findById(id);

      if (!userData) {
        throw ApiError.BadRequest(`user didn't exist`);
      }

      res.status(200).json(userData.debtorsTokens);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDebtorToken(
    req: Request<{ id: string }, unknown, { debtorName: string }>,
    res: Response<DebtorTokenModel[]>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { debtorName } = req.body;

      if (!id || !debtorName) {
        throw ApiError.BadRequest(`params missing`);
      }

      const user: UserModel | null = await UsersModel.findById(id);
      if (!user) {
        throw ApiError.BadRequest(`user didn't exist`);
      }

      user.debtorsTokens =
        user.debtorsTokens!.filter(
          (token: DebtorTokenModel) => token.debtorName !== debtorName,
        ) || [];

      //@ts-ignore
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
      const token: string = req.query.token as string;

      if (!token) {
        throw ApiError.BadRequest("can't validate token");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
        id: string;
        debtorName: string;
      };
      if (!decoded.id || !decoded.debtorName) {
        throw ApiError.BadRequest("can't validate token");
      }

      const user: UserModel | null = await UsersModel.findById(decoded.id);
      if (!user || !user.debtorsTokens) {
        throw ApiError.BadRequest(`user didn't exist`);
      }
      const targetTokenInfo = user.debtorsTokens!.find(
        (token: DebtorTokenModel) => token.debtorName === decoded.debtorName,
      );
      if (
        !targetTokenInfo ||
        !targetTokenInfo.expireDate ||
        targetTokenInfo.token !== token
      ) {
        throw ApiError.BadRequest(`something went wrong`);
      }

      const debts: IDebt[] | null = await DebtModel.find({
        lenderId: decoded.id,
        debtorName: decoded.debtorName,
        isReturned: false,
      });

      const deposits: DepositModel[] | null = await DepositModel.find({
        lenderId: decoded.id,
        debtorName: decoded.debtorName,
      });

      if (!debts || !deposits) {
        throw ApiError.BadRequest(`something went wrong`);
      }

      let debtSum;
      let depositSum;
      let total;

      if (debts && debts.length > 0) {
        debtSum = debts.reduce(
          (acc: number, debt: IDebt) => acc + debt.refundAmount,
          0,
        );
      } else {
        debtSum = 0;
      }

      if (deposits && deposits.length > 0) {
        depositSum = deposits.reduce(
          (acc: number, deposit: DepositModel) => acc + deposit.depositAmount,
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
        expireDate: targetTokenInfo.expireDate,
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
      const uniqueDebtors: UserModel[] | null = await DebtModel.aggregate([
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

      const debtorNames = uniqueDebtors.map((item: UserModel) => item._id);

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

      const user: UserModel | null = await UsersModel.findById(id);
      if (!user) {
        throw ApiError.BadRequest(`user didn't exist`);
      }
      res.status(200).json(user.debtorsTokens);
    } catch (error) {
      next(error);
    }
  }

  static async getDebtsForCurrentMonth(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const currentMonthPrefix = `${year}-${month}`;

    const getInfoForMonth = await debtService.getInfoForMonth(
      id,
      currentMonthPrefix,
    );

    res.status(200).json(getInfoForMonth);
  }

  static async getDebtsForTargetMonth(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { currentMonthPrefix } = req.body;

      const monthName = debtService.getMonthName(currentMonthPrefix);

      const getInfoForMonth = await debtService.getInfoForMonth(
        id,
        currentMonthPrefix,
      );

      res.status(200).json({ monthName, getInfoForMonth });
    } catch (error) {
      next(error);
    }
  }

  static async getAmountDebtAnalytics(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      // const chartData: ChartData[] = await DebtModel.aggregate([
      //   {
      //     $match: {
      //       lenderId: id,
      //       withoutDetails: false,
      //       refundAmount: { $gt: 0 },
      //     },
      //   },
      //   {
      //     $addFields: {
      //       month: {
      //         $substr: ["$debtDate", 0, 7],
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$month",
      //       totalRefund: { $sum: "$refundAmount" },
      //       debtAmount: { $sum: "$debtAmount" },
      //     },
      //   },
      //   {
      //     $sort: { _id: 1 },
      //   },
      // ]).exec();

      const chartData: ChartData[] = await DebtModel.aggregate([
        {
          $match: {
            lenderId: id,
            withoutDetails: false,
            refundAmount: { $gt: 0 },
          },
        },
        {
          $addFields: {
            month: {
              $substr: ["$debtDate", 0, 7],
            },
          },
        },
        {
          $group: {
            _id: "$month",
            totalRefund: { $sum: "$refundAmount" },
            debtAmount: { $sum: "$debtAmount" },
            totalReturned: {
              $sum: {
                $cond: [{ $eq: ["$isReturned", true] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]).exec();

      if (!chartData || chartData.length === 0) {
        throw ApiError.BadRequest(`No data found for user`);
      }

      const startDate = new Date(chartData[0]._id + "-01");
      const endDate = new Date(chartData[chartData.length - 1]._id + "-01");
      const monthlyRefunds: MonthlyRefundsModel = {};

      chartData.forEach((item: ChartData) => {
        monthlyRefunds[item._id] = [
          item.totalRefund,
          item.debtAmount,
          item.totalReturned,
        ];
      });

      const monthData: string[] = [];
      const refundAmount: number[] = [];
      const debtAmount: number[] = [];
      const countDebts: number[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const formattedDate: string = `${year}-${month}`;
        monthData.push(formattedDate);
        refundAmount.push(monthlyRefunds?.[formattedDate]?.[0] ?? 0);
        debtAmount.push(monthlyRefunds?.[formattedDate]?.[1] || 0);
        countDebts.push(monthlyRefunds?.[formattedDate]?.[2] || 0);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      res.status(200).json({ refundAmount, debtAmount, monthData, countDebts });
    } catch (error) {
      next(error);
    }
  }

  static async getRefundInfo() {}
}
