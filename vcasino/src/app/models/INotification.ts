export interface INotification {
  message: string;
  type: 'BALANCE' | 'BET' | 'ERROR' | null;
  data: any;
}
