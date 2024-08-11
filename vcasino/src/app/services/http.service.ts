import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {API_URL} from "../config/constants";
import {TokenStorageService} from "./token-storage.service";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private storage: TokenStorageService
  ) {
  }

  public async get(url: string) {
    return firstValueFrom(this.http.get(API_URL + url, this.getHeaders()));
  }

  public async post(url: string, body: any) {
    return firstValueFrom(this.http.post(API_URL + url, body, this.getHeaders()));
  }

  public async patch(url: string, body: any) {
    return firstValueFrom(this.http.patch(API_URL + url, body, this.getHeaders()));
  }

  public async put(url: string, body: any) {
    return firstValueFrom(this.http.put(API_URL + url, body, this.getHeaders()));
  }

  public async delete(url: string) {
    return firstValueFrom(this.http.delete(API_URL + url, this.getHeaders()));
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.storage.getToken()}`
      })
    };
  }
}
