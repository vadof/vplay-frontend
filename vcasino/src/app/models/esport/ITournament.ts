import {IMatch} from "./IMatch";

export interface ITournament {
  id: number;
  image: string;
  title: string;
  discipline: string;
  matches: IMatch[]
}
