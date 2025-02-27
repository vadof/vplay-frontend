import {IAccount} from "./IAccount";
import {ISectionUpgrades} from "./ISectionUpgrades";

export interface IAccountResponse {
  account: IAccount;
  sectionUpgrades: ISectionUpgrades[]
}
