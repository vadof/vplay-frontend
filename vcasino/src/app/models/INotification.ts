export interface INotification {
  message: string;
  type: 'BALANCE' | 'BET' | null;
  data: any;
}
