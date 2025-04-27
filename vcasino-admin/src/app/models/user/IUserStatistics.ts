import {IRegistrationStatistics} from "./IRegistrationStatistics";
import {IUserGeneralStatistics} from "./IUserGeneralStatistics";

export interface IUserStatistics {
  generalStatistics: IUserGeneralStatistics;
  registrationStatistics: IRegistrationStatistics[];
}
