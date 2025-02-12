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
import {TasksComponent} from "../../components/clicker/tasks/tasks.component";
import {IStreaksInfo} from "../../models/clicker/tasks/IStreaksInfo";
import {ITask} from "../../models/clicker/tasks/ITask";
import {numberFormatter} from "../../utils/clicker-utils";

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
    ErrorPopupComponent,
    TasksComponent
  ],
  templateUrl: './clicker-page.component.html',
  styleUrl: './clicker-page.component.scss'
})
export class ClickerPageComponent implements OnInit, AfterViewInit, OnDestroy {

  errorMessage: string = '';

  panel: 'tasks' | 'upgrades' | 'tap' | 'level' = 'tap';
  account!: IAccount;

  levels: ILevel[] = [];
  balance: string = '0';
  profitPerHour: string = '+0'
  showBalance: boolean = true;

  tasks: ITask[] = [];
  streaksInfo: IStreaksInfo | null = null;
  tasksRequestDate: Date | null = null;

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
      err => this.errorService.handleError(err)
    );
    this.http.get('/v1/clicker/accounts/levels').then(
      res => this.levels = res as ILevel[],
      err => this.errorService.handleError(err)
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

  switchPanel(value: 'tasks' | 'upgrades' | 'tap' | 'level') {
    this.panel = value;
    this.showBalance = this.panel !== 'level';

    if (value === 'tasks' && (!this.tasksRequestDate || !this.isSameDay(this.tasksRequestDate))) {
      Promise.all([
        this.http.get('/v1/clicker/tasks/streaks').then(res => this.streaksInfo = res as IStreaksInfo),
        this.http.get('/v1/clicker/tasks').then(res => this.tasks = res as ITask[])
      ]).then(() => {
        this.tasksRequestDate = new Date();
      }).catch((error) => {
        this.errorService.handleError(error);
      });
    }
  }

  private isSameDay(initialDate: Date) {
    const now: Date = new Date();
    return initialDate.getFullYear() === now.getUTCFullYear() &&
      initialDate.getMonth() === now.getUTCMonth() &&
      initialDate.getDate() === now.getUTCDate();
  }

  private updateProfitPerHour(account: IAccount) {
    this.profitPerHour = numberFormatter.format(account.passiveEarnPerHour);
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
