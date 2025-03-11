import {ITask} from "./ITask";

export interface ITaskUpdate {
  task: ITask;
  name: string | null;
  rewardCoins: number | null;
  validFrom: string | null;
  endsIn: string | null;
}
