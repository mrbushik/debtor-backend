import { DepositModel } from "../../models/depositModel";

export class DepositService {
  async getAmountDeposits(userId: string) {
    const depositsArr: any[] = await DepositModel.find({ lenderId: userId });
    if (depositsArr.length === 0) {
      return depositsArr;
    }


    return depositsArr.reduce((acc, deposit) => acc + deposit.depositAmount, 0);
  }
}
