export interface IUserInformation {
  id: number;
  name: string | null;
  username: string;
  email: string;
  oauthProvider: string | null;
  registerDate: string;
  role: string;
  usersInvited: number;
  invitedBy: string | null;
  active: boolean;
  frozen: boolean;
}
