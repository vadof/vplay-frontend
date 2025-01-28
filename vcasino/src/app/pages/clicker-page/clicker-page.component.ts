import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {ProgressComponent} from "../../components/progress/progress.component";
import {HttpService} from "../../services/http.service";
import {IAccount} from "../../models/clicker/IAccount";
import {TapComponent} from "../../components/clicker/tap/tap.component";
import {UpgradesComponent} from "../../components/clicker/upgrades/upgrades.component";
import {LevelInfoComponent} from "../../components/clicker/level-info/level-info.component";
import {LevelOverviewComponent} from "../../components/clicker/level-overview/level-overview.component";
import {ILevel} from "../../models/clicker/ILevel";
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {ErrorService} from "../../services/error.service";
import {getMessageFromError} from "../../utils/global-utils";

@Component({
  selector: 'app-clicker-page',
  standalone: true,
  imports: [
    HeaderComponent,
    NgOptimizedImage,
    ProgressComponent,
    NgIf,
    TapComponent,
    UpgradesComponent,
    LevelInfoComponent,
    LevelOverviewComponent,
    ErrorPopupComponent
  ],
  templateUrl: './clicker-page.component.html',
  styleUrl: './clicker-page.component.scss'
})
export class ClickerPageComponent implements OnInit, AfterViewInit, OnDestroy {

  errorMessage: string = '';

  levels: ILevel[] = [];
  balance: string = '0';
  profitPerHour: string = '+0'
  showBalance: boolean = true;

  panel: string = 'tap';

  account!: IAccount;

  passiveEarnInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private http: HttpService,
    private errorService: ErrorService
  ) {
    this.errorService.error$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  ngOnInit() {
    this.http.get('/v1/clicker/accounts').then(
      res => this.setAccount(res as IAccount),
      err => this.errorService.showError(getMessageFromError(err))
    );
    this.http.get('/v1/clicker/accounts/levels').then(
      res => this.levels = res as ILevel[],
      err => {
        console.log(err)
        this.errorService.showError(getMessageFromError(err))
      }
    );
  }

  ngAfterViewInit() {
    this.passiveEarnInterval = setInterval(() => {
      this.handlePassiveEarnInterval();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.passiveEarnInterval) {
      clearInterval(this.passiveEarnInterval);
    }
  }

  private updateAccountValues(account: IAccount): void {
    this.updateProfitPerHour(account);
    this.updateBalance(account);
  }

  setAccount(account: IAccount) {
    this.account = account;
    this.updateAccountValues(account);
  }

  changePanel(value: string) {
    this.panel = value;
    this.showBalance = this.panel !== 'level';
  }

  private updateProfitPerHour(account: IAccount) {
    const value: number = account.passiveEarnPerHour;
    if (value < 1000000) {
      this.profitPerHour = `+${(value / 1000).toFixed(2)}K`;
    } else {
      this.profitPerHour = `+${(value / 1000000).toFixed(2)}M`
    }
  }

  private updateBalance(account: IAccount) {
    this.balance = Math.floor(account.balanceCoins).toLocaleString();
  }

  private handlePassiveEarnInterval(): void {
    this.addCoinsToBalance(this.account.passiveEarnPerSec);
  }

  public addCoinsToBalance(value: number): void {
    this.account.balanceCoins += value;
    this.account.netWorth += value;
    this.updateBalance(this.account);
  }

  clearError() {
    this.errorMessage = '';
  }
}
