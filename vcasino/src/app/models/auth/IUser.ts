import {ICountry} from "./ICountry";

export interface IUser {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: ICountry;
}
