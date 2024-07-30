import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {IUser} from "../models/IUser";
import {Router} from "@angular/router";

const TOKEN_KEY: string = 'token';
const REFRESH_TOKEN_KEY: string = 'refreshtoken';
const USER_KEY: string = 'user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) { }

  signOut(): void {
    this.cookieService.delete(TOKEN_KEY);
    this.cookieService.delete(REFRESH_TOKEN_KEY);
    this.cookieService.delete(USER_KEY);
    this.router.navigate(['login']);
  }

  public saveToken(token: string): void {
    this.cookieService.set(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return this.cookieService.get(TOKEN_KEY);
  }

  public saveRefreshToken(refreshToken: string): void {
    this.cookieService.set(REFRESH_TOKEN_KEY, refreshToken);
  }

  public getRefreshToken(): string | null {
    return this.cookieService.get(REFRESH_TOKEN_KEY);
  }

  public saveUser(user: IUser): void {
    this.cookieService.set(USER_KEY, JSON.stringify(user));
  }

  public getUser(): IUser | null {
    const user: string = this.cookieService.get(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
