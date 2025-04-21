export interface ITransaction {
  id: string;
  type: string;
  payload: string;
  status: string;
  createdAt: string;
  formattedDate: string;
  modifiedAt: string;
}
