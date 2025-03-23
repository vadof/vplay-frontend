import {IAccount} from "./IAccount";

export interface IAccountWalletResponse {
  account: IAccount;
  updatedWalletBalance: number;
}
