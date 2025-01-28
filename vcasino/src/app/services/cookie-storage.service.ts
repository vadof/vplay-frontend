import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {IUser} from "../models/auth/IUser";
import {Router} from "@angular/router";
import {AuthResponse} from "../models/auth/AuthReposnse";

const TOKEN_KEY: string = 'accessToken';
const REFRESH_TOKEN_KEY: string = 'refreshToken';
const USER_KEY: string = 'user';

@Injectable({
  providedIn: 'root'
})
export class CookieStorage {

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) {
  }

  signOut(redirect: boolean = true): void {
    this.cookieService.delete(TOKEN_KEY, '/');
    this.cookieService.delete(REFRESH_TOKEN_KEY, '/');
    this.cookieService.delete(USER_KEY, '/');

    if (redirect) {
      this.router.navigate(['login']);
    }
  }

  public saveAuthResponse(authResponse: AuthResponse): void {
    this.saveToken(authResponse.token);
    this.saveRefreshToken(authResponse.refreshToken);
    this.saveUser(authResponse.user);
  }

  public saveToken(token: string): void {
    this.cookieService.set(TOKEN_KEY, token, undefined, '/');
  }

  public getToken(): string | null {
    return this.cookieService.get(TOKEN_KEY);
  }

  public saveRefreshToken(refreshToken: string): void {
    this.cookieService.set(REFRESH_TOKEN_KEY, refreshToken, undefined, '/');
  }

  public getRefreshToken(): string | null {
    return this.cookieService.get(REFRESH_TOKEN_KEY);
  }

  public saveUser(user: IUser): void {
    this.cookieService.set(USER_KEY, JSON.stringify(user), undefined, '/');
  }

  public getUser(): IUser | null {
    const user: string = this.cookieService.get(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
