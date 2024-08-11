import {ICondition} from "./ICondition";

export interface IUpgrade {
  name: string;
  level: number;
  section: string;
  profitPerHour: number;
  profitPerHourDelta: number;
  price: number;
  condition: ICondition | null;
  maxLevel: boolean;
  available: boolean;
}
