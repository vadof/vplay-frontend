export interface ITask {
  id: number;
  type: string;
  name: string;
  link: string;
  durationInSeconds: number;
  service: string;
  rewardCoins: number | string;
  endsIn: string;
  received: boolean;
  canClaim: boolean;
  canClaimAt: number | undefined;
}
