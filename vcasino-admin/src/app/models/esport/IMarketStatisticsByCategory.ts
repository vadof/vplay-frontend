import {IMarketStatistics} from "./IMarketStatistics";

export interface IMarketStatisticsByCategory {
  category: string;
  marketPairs: IMarketStatistics[][];
}
