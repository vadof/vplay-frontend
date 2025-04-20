import {IMarketPair} from "./IMarketPair";

export interface IMarketsByCategory {
  category: string;
  marketPairs: IMarketPair[];
  allClosed: boolean;
}
