import {IChartData} from "./IChartData";

export interface IGeneralStatistics {
  activeUsersToday: number;
  clicksToday: number;
  clicksPerUser: number;
  suspiciousActivityCount: number;
  frozenAccounts: number;
  streaksTakenToday: number;
  totalNetWorth: number;
  totalUpgradesPurchased: number;
  activeUsersChart: IChartData<string, number>;
  totalClicksChart: IChartData<string, number>;
  levelPercentageChart: IChartData<number, number>;
}
