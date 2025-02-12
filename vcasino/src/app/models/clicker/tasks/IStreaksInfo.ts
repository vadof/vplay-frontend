import {IDailyReward} from "./IDailyReward";
import {IStreakState} from "./IStreakState";

export interface IStreaksInfo {
  rewardsByDays: IDailyReward[];
  state: IStreakState;
}
