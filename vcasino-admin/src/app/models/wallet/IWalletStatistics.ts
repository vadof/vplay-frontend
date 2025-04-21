import {IWalletInformation} from "./IWalletInformation";

export interface IWalletStatistics {
  totalWalletsBalance: number;
  totalTransactions: number;
  vDollarToVCoinAmount: number;
  vCoinToVDollarAmount: number;
  depositCount: number;
  depositAmount: number;
  withdrawCount: number;
  withdrawAmount: number;
  top10RichestWallets: IWalletInformation[];
}
