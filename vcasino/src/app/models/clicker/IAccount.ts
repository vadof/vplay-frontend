export interface IAccount {
  level: number;
  netWorth: number;
  balanceCoins: number;
  availableTaps: number;
  maxTaps: number;
  earnPerTap: number;
  tapsRecoverPerSec: number;
  passiveEarnPerHour: number;
  passiveEarnPerSec: number;
}
