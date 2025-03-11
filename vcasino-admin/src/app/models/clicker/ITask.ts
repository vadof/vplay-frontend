export interface ITask {
  id: number;
  type: string;
  name: string;
  link: string;
  durationInSeconds: number | null;
  serviceName: string;
  rewardCoins: number;
  validFrom: string;
  endsIn: string;
  createdAt: string;
  completedTimes: number;
  active: boolean;
  show: boolean;
  edit: boolean;
  item: {label: string, value: string | number, link: boolean, editable: boolean, inputType: string | null, inputValue: any}[];
}
