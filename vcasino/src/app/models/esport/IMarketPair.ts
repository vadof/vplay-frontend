import {IMarket} from "./IMarket";

export interface IMarketPair {
  markets: IMarket[];
  closed: boolean;
}
