import {Component, OnInit} from '@angular/core';
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {HeaderComponent} from "../../components/header/header.component";
import {NgForOf, NgIf} from "@angular/common";
import {MainStatisticsComponent} from "../../components/main-statistics/main-statistics.component";
import {HttpService} from "../../services/http.service";
import {ErrorService} from "../../services/error.service";
import {IWalletStatistics} from "../../models/wallet/IWalletStatistics";
import {RegistrationFormComponent} from "../../components/registration-form/registration-form.component";
import {SearchComponent} from "../../components/search/search.component";
import {IWalletInformation} from "../../models/wallet/IWalletInformation";
import {ChartComponent} from "../../components/chart/chart.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-wallet-page',
  standalone: true,
  imports: [
    ErrorPopupComponent,
    HeaderComponent,
    NgIf,
    MainStatisticsComponent,
    NgForOf,
    RegistrationFormComponent,
    SearchComponent,
    ChartComponent,
    FormsModule
  ],
  templateUrl: './wallet-page.component.html',
  styleUrl: './wallet-page.component.scss'
})
export class WalletPageComponent implements OnInit {
  errorMessage: string = '';

  statistics: { label: string, value: number }[] = [];

  topWallets: IWalletInformation[] = [];

  walletInformation: { label: string; value: any; clickable?: boolean; onClick?: () => void}[] = [];
  currentWalletInformation: IWalletInformation | undefined;

  searchHistory: IWalletInformation[] = [];
  searchOptions: { label: string, type: 'string' | 'number' }[] = [
    {label: 'ID', type: 'number'}
  ];

  addDollarsValue: number = 0;
  referralBonus: number = 0;

  constructor(private http: HttpService,
              private errorService: ErrorService) {
    this.errorService.error$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  ngOnInit(): void {
    this.http.get('/v1/wallet/admin/statistics').then(
      res => {
        const stats: IWalletStatistics = res as IWalletStatistics;
        this.topWallets = stats.top10RichestWallets;
        this.statistics = [
          {label: 'Total Wallets Balance', value: stats.totalWalletsBalance ? stats.totalWalletsBalance : 0},
          {label: 'Total Transactions', value: stats.totalTransactions ? stats.totalTransactions : 0},
          {label: 'Total VDollars Converted', value: stats.vDollarToVCoinAmount ? stats.vDollarToVCoinAmount : 0},
          {label: 'Total VCoins Converted', value: stats.vCoinToVDollarAmount ? stats.vCoinToVDollarAmount : 0},
          {label: 'Total Deposits', value: stats.depositCount ? stats.depositCount : 0},
          {label: 'Total Deposits Amount', value: stats.depositAmount ? stats.depositAmount : 0},
          {label: 'Total Withdrawals', value: stats.withdrawCount ? stats.withdrawCount : 0},
          {label: 'Total Withdrawals Amount', value: stats.withdrawAmount ? stats.withdrawAmount : 0}
        ];
      },
      err => this.errorService.handleError(err)
    );
  }

  clearError(): void {
    this.errorMessage = '';
  }

  searchWallet(searchOutput: { option: string, value: string }): void {
    const id: number = +searchOutput.value;
    this.fetchWalletStatistics(id);
  }

  fetchWalletStatistics(id: number): void {
    if (this.currentWalletInformation === undefined || this.currentWalletInformation.id !== id) {

      const existingInformation = this.searchHistory.find(ui => ui.id === id);
      if (existingInformation) {
        this.displayWalletInformation(existingInformation);
      } else {
        this.http.get(`/v1/wallet/admin/statistics/wallet?id=${id}`).then(
          res => this.displayWalletInformation(res as IWalletInformation),
          err => this.errorService.handleError(err)
        );
      }
    }
  }

  switchWalletInformationItem(accountInformation: IWalletInformation) {
    const existing = this.searchHistory.find(ai => ai.id === accountInformation.id);
    this.displayWalletInformation(existing!);
  }

  private displayWalletInformation(walletInformation: IWalletInformation) {
    if (this.currentWalletInformation === undefined
      || !this.searchHistory.some(u => u.id === walletInformation.id)) {
      this.searchHistory.unshift(walletInformation);
    }

    this.currentWalletInformation = walletInformation;
    this.currentWalletInformation.showTransactions = false;

    const formattedDate: string = new Date(walletInformation.updatedAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).replace(",", "");

    this.walletInformation = [
      {label: 'ID:', value: walletInformation.id},
      {label: 'Balance:', value: walletInformation.balance},
      {label: 'Reserved:', value: walletInformation.reserved},
      {
        label: 'Invited By',
        value: walletInformation.invitedBy ? walletInformation.invitedBy : 'N/A',
        clickable: walletInformation.invitedBy !== null,
        onClick: walletInformation.invitedBy
          ? () => this.fetchWalletStatistics(walletInformation.invitedBy)
          : undefined
      },
      {
        label: 'Total transactions',
        value: walletInformation.totalTransactions,
        clickable: walletInformation.totalTransactions > 0,
        onClick: walletInformation.totalTransactions > 0
          ? () => this.currentWalletInformation!.showTransactions = !this.currentWalletInformation!.showTransactions
          : undefined
      },
      {label: 'Frozen:', value: walletInformation.frozen ? 'Yes' : 'No'},
      {label: 'Updated at:', value: formattedDate},
      {label: 'Referral Bonus:', value: walletInformation.referralBonus ? walletInformation.referralBonus : 'N/A'}
    ];

    this.referralBonus = walletInformation.referralBonus === null ? 0 : walletInformation.referralBonus;

    this.currentWalletInformation.latestTransactions.forEach(t => {
      t.formattedDate = new Date(t.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "");
    });
  }

  addVDollars(): void {
    if (this.currentWalletInformation === null || this.addDollarsValue <= 0) return;

    const body = {walletId: this.currentWalletInformation!.id, amount: this.addDollarsValue};

    this.http.post('/v1/wallet/admin/deposit', body).then(
      res => {
        this.addDollarsValue = 0;
        const response = res as { amount: number };
        this.currentWalletInformation!.balance = response.amount;
        this.displayWalletInformation(this.currentWalletInformation!);
      },
      err => this.errorService.handleError(err)
    );
  }

  setReferralBonus(): void {
    if (this.currentWalletInformation === null || this.referralBonus < 0) return;

    const body = {referralId: this.currentWalletInformation!.id, bonusAmount: this.referralBonus};

    this.http.post('/v1/wallet/admin/referral', body).then(
      () => {
        this.referralBonus = 0;
        this.currentWalletInformation!.referralBonus = body.bonusAmount;
        this.displayWalletInformation(this.currentWalletInformation!);
      },
      err => this.errorService.handleError(err)
    );
  }
}
