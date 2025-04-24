export interface IMarketStatistics {
  matchId: number;
  marketId: number;
  marketType: string;
  outcome: number;
  closed: boolean;
  participant: number;
  mapNumber: number;
  result: string | null;
  betCount: number;
  totalAmountWagered: number;
  totalAmountWin: number;
  totalAmountLoss: number;
  averageBetAmount: number;
  maxBetAmount: number;
}
