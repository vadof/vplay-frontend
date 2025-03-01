import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AuthResponse} from "../models/auth/AuthReposnse";
import {Observable} from "rxjs";

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

  public registerAdmin(request: any): Observable<void> {
    return this.http.post<void>(`${AUTH_API}/admin/register`, request, httpOptions);
  }

  public refreshToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/refreshToken`, {refreshToken: token}, httpOptions);
  }
}
