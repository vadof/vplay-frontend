import {IUpgrade} from "./IUpgrade";

export interface ISectionUpgrades {
  order: number;
  section: string;
  upgrades: IUpgrade[]
}
