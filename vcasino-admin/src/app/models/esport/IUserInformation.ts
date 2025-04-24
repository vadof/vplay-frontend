import {IUserBet} from "./IUserBet";

export interface IUserInformation {
  userId: number;
  totalBetsPlaced: number;
  totalWinBets: number;
  totalCancelledBets: number;
  totalLossBets: number;
  totalAmountWagered: number;
  totalWinAmount: number;
  totalLossAmount: number;
  biggestBet: number;
  smallestBet: number;
  avgBet: number;
  totalTournamentsParticipated: number;
  totalMatchesParticipated: number;
  winPercentage: number;
  latestBets: IUserBet[];
}
