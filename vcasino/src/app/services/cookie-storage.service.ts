import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {IUser} from "../models/auth/IUser";
import {Router} from "@angular/router";
import {AuthResponse} from "../models/auth/AuthReposnse";
import {TaskProgress} from "../components/clicker/tasks/tasks.component";

const TOKEN_KEY: string = 'accessToken';
const REFRESH_TOKEN_KEY: string = 'refreshToken';
const USER_KEY: string = 'user';
const TASK_KEY: string = 'task';
const REFERRAL_KEY: string = 'ref';

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

  public setTaskProgress(taskClick: TaskProgress): void {
    this.cookieService.set(TASK_KEY, JSON.stringify(taskClick), 1, '/');
  }

  public getTaskProgress(): TaskProgress | null {
    const taskClick = this.cookieService.get(TASK_KEY);
    return taskClick ? JSON.parse(taskClick) : null;
  }

  public removeTaskProgress(): void {
    this.cookieService.set(TASK_KEY, '', new Date(0), '/');
  }

  public saveReferral(ref: string): void {
    this.cookieService.set(REFERRAL_KEY, ref, undefined, '/');
  }

  public removeReferral(): void {
    this.cookieService.set(REFERRAL_KEY, '', new Date(0), '/');
  }
}
