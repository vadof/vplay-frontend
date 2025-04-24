import {IAdditionalMatchStatistics} from "./IAdditionalMatchStatistics";
import {IMarketStatisticsByCategory} from "./IMarketStatisticsByCategory";

export interface IMatchStatistics {
  matchId: number;
  matchPage: number;
  format: string;
  startDate: string;
  status: string;
  winner: number | null;
  winProbability1: number;
  winProbability2: number;
  tournamentTitle: string;
  tournamentPage: string;
  discipline: string;
  participant1Name: string;
  participant2Name: string;
  showStatistics: boolean;
  additionalStatistics: IAdditionalMatchStatistics;
  showMarkets: boolean;
  marketsByCategory: IMarketStatisticsByCategory[] | undefined;
}
