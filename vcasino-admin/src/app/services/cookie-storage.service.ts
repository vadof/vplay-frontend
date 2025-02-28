import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {IUser} from "../models/auth/IUser";
import {Router} from "@angular/router";
import {AuthResponse} from "../models/auth/AuthReposnse";

const TOKEN_KEY: string = 'accessToken';
const REFRESH_TOKEN_KEY: string = 'refreshToken';
const USER_KEY: string = 'user';
const ROLE_KEY: string = 'role';

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

  public saveAuthResponse(authResponse: AuthResponse, role: string): void {
    this.saveToken(authResponse.token);
    this.saveRefreshToken(authResponse.refreshToken);
    this.saveUser(authResponse.user);
    this.saveRole(role);
  }

  public saveRole(role: string): void {
    this.cookieService.set(ROLE_KEY, role, undefined, '/')
  }

  public getRole(): string | null {
    const role = this.cookieService.get(ROLE_KEY);
    return role ? role : null;
  }

  public saveToken(token: string): void {
    this.cookieService.set(TOKEN_KEY, token, undefined, '/');
  }

  public getToken(): string | null {
    const token = this.cookieService.get(TOKEN_KEY);
    return token ? token : null;
  }

  public saveRefreshToken(refreshToken: string): void {
    this.cookieService.set(REFRESH_TOKEN_KEY, refreshToken, undefined, '/');
  }

  public getRefreshToken(): string | null {
    const token = this.cookieService.get(REFRESH_TOKEN_KEY);
    return token ? token : null;
  }

  public saveUser(user: IUser): void {
    this.cookieService.set(USER_KEY, JSON.stringify(user), undefined, '/');
  }

  public getUser(): IUser | null {
    const user: string = this.cookieService.get(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

}
