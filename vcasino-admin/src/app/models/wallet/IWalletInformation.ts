import {ITransaction} from "./ITransaction";

export interface IWalletInformation {
  id: number;
  balance: number;
  reserved: number;
  invitedBy: number;
  updatedAt: string;
  frozen: boolean;
  referralBonus: number | null;
  totalTransactions: number;
  latestTransactions: ITransaction[];
  showTransactions: boolean;
}
