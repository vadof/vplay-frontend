import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {API_URL} from "../config/constants";
import {AuthResponse} from "../models/auth/AuthReposnse";
import { Observable } from "rxjs";
import { ICountry } from "../models/auth/ICountry";

const AUTH_API = `${API_URL}/v1/users/auth`

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) {}

  public getCountries(): Observable<ICountry[]> {
    return this.http.get<ICountry[]>(`${AUTH_API}/countries`, httpOptions);
  }

  public login(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/login`, request, httpOptions);
  }

  public register(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/register`, request, httpOptions);
  }

  public refreshToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/refreshToken`, {refreshToken: token}, httpOptions);
  }
}
