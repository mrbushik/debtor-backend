import { DebtModel, IDebt } from "../../models/debtModel";

export class DebtService {
  async getActiveDebts(userId: string): Promise<IDebt[]> {
    return await DebtModel.find({ lenderId: userId, isReturned: false });
  }

  async getAllDebts(userId: string): Promise<IDebt[]> {
    return await DebtModel.find({ lenderId: userId });
  }

  async getCurrentDebt(debtId: string): Promise<IDebt | null> {
    return await DebtModel.findById(debtId);
  }

  async getInfoForMonth(id: string, currentMonthPrefix: string) {
    const debtsData = {
      borrowedThisMonth: 0,
      expectToReturnThisMonth: 0,
      alreadyReturnedThisMonth: 0,
      expectEarnings: 0,
      alreadyEarn: 0,
    };

    const debtsForPeriod = await DebtModel.aggregate([
      {
        $match: {
          lenderId: id,
          debtDate: { $regex: `^${currentMonthPrefix}` },
        },
      },
      {
        $group: {
          _id: null,
          totalRefundAmount: { $sum: "$refundAmount" },
          borrowedAmount: { $sum: "$debtAmount" },
        },
      },
    ]);

    const expectedReturnedAmount = await DebtModel.aggregate([
      {
        $match: {
          lenderId: id,
          dueDate: { $regex: `^${currentMonthPrefix}` },
        },
      },
      {
        $group: {
          _id: null,
          expectedRefund: { $sum: "$refundAmount" },
          borrowedAmount: { $sum: "$debtAmount" },
        },
      },
    ]);

    const returnedDebts = await DebtModel.aggregate([
      {
        $match: {
          lenderId: id,
          returnedDate: { $regex: `^${currentMonthPrefix}` },
        },
      },
      {
        $group: {
          _id: null,
          totalRefundAmount: { $sum: "$refundAmount" },
          borrowedAmount: { $sum: "$debtAmount" },
        },
      },
    ]);

    const debtsForPeriodData =
      debtsForPeriod?.length > 0
        ? debtsForPeriod[0]
        : { totalRefundAmount: 0, borrowedAmount: 0 };
    const expectedReturnedAmountData =
      expectedReturnedAmount.length > 0
        ? expectedReturnedAmount[0]
        : { expectedRefund: 0, borrowedAmount: 0 };
    const returnedDebtsData =
      returnedDebts.length > 0
        ? returnedDebts[0]
        : { totalRefundAmount: 0, borrowedAmount: 0 };

    debtsData.borrowedThisMonth = debtsForPeriodData.borrowedAmount;
    debtsData.expectToReturnThisMonth =
      expectedReturnedAmountData.expectedRefund;
    debtsData.alreadyReturnedThisMonth = returnedDebtsData.totalRefundAmount;

    debtsData.expectEarnings = parseFloat(
      (
        expectedReturnedAmountData.expectedRefund -
        expectedReturnedAmountData.borrowedAmount
      ).toFixed(2),
    );

    debtsData.alreadyEarn = parseFloat(
      (
        returnedDebtsData.totalRefundAmount - returnedDebtsData.borrowedAmount
      ).toFixed(2),
    );

    return debtsData;
  }

  getMonthName(dateString: string): string {
    const [year, month] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  }

}
