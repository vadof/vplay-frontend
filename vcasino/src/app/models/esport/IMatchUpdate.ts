import {IMarket} from "./IMarket";
import {IMatchMap} from "./IMatchMap";

export interface IMatchUpdate {
  matchId: number;
  winnerMatchMarkets: IMarket[];
  matchMaps: IMatchMap[];
  ended: boolean;
}
