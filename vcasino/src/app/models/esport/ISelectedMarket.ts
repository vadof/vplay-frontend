import {IMarket} from "./IMarket";
import {IMatch} from "./IMatch";

export interface ISelectedMarket {
  market: IMarket;
  match: IMatch;
  marketCategory: string;
}
