import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AuthResponse} from "../models/auth/AuthReposnse";
import {Observable} from "rxjs";
import {IEmailSendingOptions} from "../models/auth/IEmailSendingOptions";

const AUTH_API = `${environment.API_URL}/v1/users/auth`

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
  withCredentials: true
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) {}

  public login(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/login`, request, httpOptions);
  }

  public register(request: any): Observable<IEmailSendingOptions> {
    return this.http.post<IEmailSendingOptions>(`${AUTH_API}/register`, request, httpOptions);
  }

  public confirmUsernameRegistration(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/username-confirmation`, request, httpOptions);
  }

  public confirmEmailRegistration(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/email-confirmation`, request, httpOptions);
  }

  public resendEmail(request: any): Observable<IEmailSendingOptions> {
    return this.http.post<IEmailSendingOptions>(`${AUTH_API}/email-confirmation-resend`, request, httpOptions);
  }

  public deletePendingUser(request: any): Observable<void> {
    return this.http.post<void>(`${AUTH_API}/delete-pending-user`, request, httpOptions);
  }

  public refreshToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/refreshToken`, {refreshToken: token}, httpOptions);
  }
}
