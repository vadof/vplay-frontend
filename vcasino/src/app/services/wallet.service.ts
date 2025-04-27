import {Injectable} from '@angular/core';
import {HttpService} from "./http.service";
import {BehaviorSubject, Observable} from "rxjs";
import {IBalanceResponse} from "../models/IBalanceResponse";

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private balanceSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0.00);
  balance$: Observable<number> = this.balanceSubject.asObservable();
  balanceLoaded: boolean = false;

  constructor(private http: HttpService) {
  }

  initBalance(): void {
    if (this.balanceLoaded) return;

    this.http.get('/v1/wallet/balance').then(
      res => {
        this.balanceSubject.next((res as IBalanceResponse).amount);
        this.balanceLoaded = true;
      },
      () => this.balanceSubject.next(0)
    );
  }

  setBalance(newBalance: number): void {
    this.balanceSubject.next(newBalance);
  }

}
