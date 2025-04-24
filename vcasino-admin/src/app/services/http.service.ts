import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieStorage} from "./cookie-storage.service";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private storage: CookieStorage
  ) {
  }

  public async get(url: string) {
    return firstValueFrom(this.http.get(environment.API_URL + url, this.getHeaders()));
  }

  public async post(url: string, body: any, contentType: string | null = 'application/json') {
    return firstValueFrom(this.http.post(environment.API_URL + url, body, this.getHeaders(contentType)));
  }

  public async patch(url: string, body: any) {
    return firstValueFrom(this.http.patch(environment.API_URL + url, body, this.getHeaders()));
  }

  public async put(url: string, body: any) {
    return firstValueFrom(this.http.put(environment.API_URL + url, body, this.getHeaders()));
  }

  public async delete(url: string) {
    return firstValueFrom(this.http.delete(environment.API_URL + url, this.getHeaders()));
  }

  private getHeaders(contentType: string | null = 'application/json') {
    const token: string | null = this.storage.getToken();
    const headersConfig: { [key: string]: string } = {};

    if (contentType) {
      headersConfig['Content-Type'] = contentType;
    }

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headersConfig),
    };
  }
}
