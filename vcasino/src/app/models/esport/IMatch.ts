import {IParticipant} from "./IParticipant";
import {ITournament} from "./ITournament";
import {IMatchMap} from "./IMatchMap";
import {IMarketPair} from "./IMarketPair";

export interface IMatch {
  id: number;
  participant1: IParticipant;
  participant2: IParticipant;
  startDate: number;
  dateText: string;
  winnerMatchMarkets: IMarketPair;
  matchMaps: IMatchMap[];
  tournament: ITournament;
}
