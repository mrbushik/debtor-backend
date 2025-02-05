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
}
