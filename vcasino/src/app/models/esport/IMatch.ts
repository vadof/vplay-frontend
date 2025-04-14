import {IParticipant} from "./IParticipant";
import {IMarket} from "./IMarket";
import {ITournament} from "./ITournament";

export interface IMatch {
  id: number;
  participant1: IParticipant;
  participant2: IParticipant;
  startDate: string;
  winnerMatchMarket1: IMarket
  winnerMatchMarket2: IMarket
  tournament: ITournament
}
