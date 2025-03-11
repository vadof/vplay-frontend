import {IChartData} from "./IChartData";

export interface IAccountInformation {
  id: number;
  username: string;
  level: number;
  balanceCoins: number;
  netWorth: number;
  passiveEarnPerHour: number;
  lastSyncDate: string;
  suspiciousActionsNumber: number;
  frozen: boolean;
  purchasedUpgrades: number;
  streak: number;
  lastReceivedStreakDay: number;
  completedTasks: number;
  totalClicks: number;
  bestClickDayAmount: number;
  bestClickDayDate: string;
  clicksChart: IChartData<string, number>;
}
