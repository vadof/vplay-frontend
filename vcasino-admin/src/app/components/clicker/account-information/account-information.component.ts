import {Component, OnInit} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {ITopAccount} from "../../../models/clicker/ITopAccount";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SearchComponent} from "../../search/search.component";
import {IAccountInformation} from "../../../models/clicker/IAccountInformation";
import {numberFormatter} from "../../../utils/global-utils";
import {ChartComponent} from "../../chart/chart.component";
import {IChartData} from "../../../models/clicker/IChartData";

@Component({
  selector: 'app-account-information',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    SearchComponent,
    NgIf,
    ChartComponent
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss'
})
export class AccountInformationComponent implements OnInit {
  top10Accounts: ITopAccount[] = [];
  accountInformationData: { label: string, value: any }[] = [];

  searchHistory: IAccountInformation[] = [];
  currentAccountInformation: IAccountInformation | undefined;
  addCoinsValue: number | undefined;
  numberFormatYTicksCallback = (value: number) => numberFormatter.format(value);

  searchOptions: {label: string, type: 'string' | 'number'}[] =  [{label: 'ID', type: 'number'}, {label: 'Username', type: 'string'}];

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.http.get('/v1/clicker-data/admin/statistics/accounts/top').then(
      res => {
        this.top10Accounts = res as (ITopAccount[]);
        this.top10Accounts.forEach(a => a.netWorth = numberFormatter.format(+a.netWorth));
      },
      err => this.errorService.handleError(err)
    );
  }

  fetchAccountStatistics(searchOutput: {option: string, value: string}) {
    let url: string = '/v1/clicker-data/admin/statistics/accounts?';
    if (searchOutput.option === 'Username') {
      url += `username=${searchOutput.value}`
    } else {
      url += `id=${searchOutput.value}`
    }

    this.http.get(url).then(
      res => this.displayAccountInformation(res as IAccountInformation),
      err => this.errorService.handleError(err)
    );
  }

  switchAccountInformationItem(accountInformation: IAccountInformation) {
    const existing = this.searchHistory.find(ai => ai.id === accountInformation.id);
    this.displayAccountInformation(existing!);
  }

  addCoins() {
    if (!this.addCoinsValue) return;

    const body = {accountId: this.currentAccountInformation!.id, addCoins: this.addCoinsValue};

    this.http.post('/v1/clicker/admin/accounts/improve', body).then(
      res => {
        this.addCoinsValue = 0;
        const response = res as { balanceCoins: number, netWorth: number, level: number };
        this.currentAccountInformation!.balanceCoins = response.balanceCoins;
        this.currentAccountInformation!.netWorth = response.netWorth;
        this.currentAccountInformation!.level = response.level;
        this.displayAccountInformation(this.currentAccountInformation!);
      },
      err => this.errorService.handleError(err)
    );
  }

  changeFrozenStatus() {
    const accountId: number = this.currentAccountInformation!.id;
    const currentStatus: boolean = this.currentAccountInformation!.frozen;
    const body = {accountId, status: !currentStatus};
    this.http.post('/v1/clicker/admin/accounts/frozen-status', body).then(
      () => {
        this.currentAccountInformation!.frozen = !currentStatus;
        this.displayAccountInformation(this.currentAccountInformation!);
      }, err => this.errorService.handleError(err)
    );
  }

  private displayAccountInformation(accountInformation: IAccountInformation) {
    if (this.currentAccountInformation === undefined
      || !this.searchHistory.some(u => u.username === accountInformation.username)) {
      this.searchHistory.unshift(accountInformation);
    }

    this.currentAccountInformation = accountInformation;

    this.accountInformationData = [
      {label: 'Username', value: accountInformation.username},
      {label: 'Level', value: accountInformation.level},
      {label: 'Balance coins', value: numberFormatter.format(accountInformation.balanceCoins),},
      {label: 'Net Worth', value: numberFormatter.format(accountInformation.netWorth)},
      {label: 'Passive earn per hour', value: accountInformation.passiveEarnPerHour},
      {label: 'Last online', value: accountInformation.lastSyncDate},
      {label: 'Suspicious actions', value: accountInformation.suspiciousActionsNumber},
      {label: 'Frozen', value: accountInformation.frozen},
      {label: 'Purchased upgrades', value: accountInformation.purchasedUpgrades},
      {label: 'Streak', value: accountInformation.streak ? accountInformation.streak : 0},
      {
        label: 'Last received streak date',
        value: accountInformation.lastReceivedStreakDay ? accountInformation.lastReceivedStreakDay : 'N/A'
      },
      {label: 'Completed tasks', value: accountInformation.completedTasks},
      {label: 'Total clicks', value: numberFormatter.format(accountInformation.totalClicks)},
      {
        label: 'Max clicks',
        value: `${numberFormatter.format(accountInformation.bestClickDayAmount)} - ${accountInformation.bestClickDayDate}`
      },
    ];
  }

  selectChartOption(option: string) {
    const id: number = this.currentAccountInformation!.id;
    option = encodeURI(option);

    this.http.get(`/v1/clicker-data/admin/statistics/accounts/charts?accountId=${id}&chartOption=${option}`).then(
      res => this.currentAccountInformation!.clicksChart = res as IChartData<string, number>,
      err => this.errorService.handleError(err)
    );
  }

}
