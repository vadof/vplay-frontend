import {IRegistrationStatistics} from "./IRegistrationStatistics";

export interface IUserGeneralStatistics {
  registeredUsers: number;
  registeredUsersToday: number;
  registeredUsersLastWeek: number;
  registeredUsersLastMonth: number;
  registeredUsersInvitedByOthers: number;
  registeredUsersWithOAuth: number;
  frozenUsers: number;
  activeUsers: number;
  latestRegisteredUsers: IRegistrationStatistics[];
}
