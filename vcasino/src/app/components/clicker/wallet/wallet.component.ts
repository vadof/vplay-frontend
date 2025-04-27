import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IAccount} from "../../../models/clicker/IAccount";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {numberFormatter} from "../../../utils/clicker-utils";
import {HttpService} from "../../../services/http.service";
import {WalletService} from "../../../services/wallet.service";
import {ErrorService} from "../../../services/error.service";
import {IAccountWalletResponse} from "../../../models/clicker/IAccountWalletResponse";
import {ConfettiService} from "../../../services/confetti.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    FormsModule,
    NgIf
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent implements OnInit, OnDestroy {
  @Input() account!: IAccount;
  @Output() accountUpdate: EventEmitter<IAccount> = new EventEmitter<IAccount>();

  selectedOption: 'w' | 'd' = 'w'

  intervalId: ReturnType<typeof setInterval> | null = null;

  step: number = 1000;
  selectedAmount: number = 0;
  sliderMax: number = 0;
  balance: number = 0;
  valueChangeStep: number = 100000;
  private vDollars: number = 0;
  successMessage: string = '';
  successTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpService,
              private walletService: WalletService,
              private errorService: ErrorService,
              private confetti: ConfettiService
  ) {
  }

  ngOnInit() {
    this.switchOption('w');
    this.intervalId = setInterval(() => this.calculateSliderMax(), 2000);

    this.subscriptions.add(
      this.walletService.balance$.subscribe((updatedBalance) => {
        this.vDollars = updatedBalance;
        if (this.selectedOption === 'd') {
          this.balance = this.vDollars;
          this.calculateSliderMax();
        }
      })
    );
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.successTimeoutId) clearTimeout(this.successTimeoutId);
    this.subscriptions.unsubscribe();
  }

  switchOption(option: 'w' | 'd') {
    if (option === 'w') {
      this.balance = this.account.balanceCoins;
      this.step = 1000;
      this.valueChangeStep = 100000;
    } else {
      this.balance = this.vDollars;
      this.step = 0.01
      this.valueChangeStep = 1;
    }
    this.selectedOption = option;
    this.selectedAmount = 0;
    this.calculateSliderMax();
  }

  private calculateSliderMax() {
    this.sliderMax = Math.floor(this.balance / this.step) * this.step;
    if (this.selectedOption === 'd') {
      this.sliderMax = parseFloat(this.sliderMax.toFixed(2));
    }
  }

  minus() {
    this.selectedAmount = Math.max(
      Math.round((this.selectedAmount - this.valueChangeStep) * 100) / 100,
      0
    );
  }

  plus() {
    this.selectedAmount = Math.min(
      Math.round((this.selectedAmount + this.valueChangeStep) * 100) / 100,
      this.sliderMax
    );
  }

  onValueChange(amount: number) {
    if (amount < 0) {
      amount = -amount;
    }

    if (this.selectedOption === 'w') {
      if (amount > 100000) {
        const remainder: number = amount % this.step;
        this.selectedAmount = Math.min(this.sliderMax, amount - remainder);
      } else {
        this.selectedAmount = Math.min(this.sliderMax, amount);
      }
    } else {
      this.selectedAmount = Math.ceil(Math.min(this.sliderMax, amount) * 100) / 100;
    }
  }

  confirmConversion() {
    const body = {amount: this.selectedAmount};
    if (this.selectedOption === 'w') {
      this.http.post('/v1/clicker/currency/vcoins/vdollars', body).then(
        res => this.handleSuccessConversion(res as IAccount),
        err => this.errorService.handleError(err));
    } else {
      this.http.post('/v1/clicker/currency/vdollars/vcoins', body).then(
        res => {
          const response: IAccountWalletResponse = res as IAccountWalletResponse;
          this.walletService.setBalance(response.updatedWalletBalance);
          this.handleSuccessConversion(response.account);
        },
        err => this.errorService.handleError(err));
    }
  }

  private handleSuccessConversion(account: IAccount) {
    this.confetti.launchConfetti();
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }

    this.accountUpdate.emit(account);
    this.selectedAmount = 0;
    this.calculateSliderMax();

    this.successMessage = this.selectedOption === 'w' ?
      'Withdrawal request submitted! Your VDollars will appear shortly.' :
      'VDollars successfully converted to VCoins!'

    this.successTimeoutId = setTimeout(() => {
      this.successMessage = '';
    }, 10000)
  }

  get convertedAmount(): string | number {
    if (this.selectedOption === 'w') {
      return this.selectedAmount / 100000;
    } else {
      return numberFormatter.format(this.selectedAmount * 90000);
    }
  }

  get progressBackground() {
    const percentage: number = this.selectedAmount < this.step ? 0 : (this.selectedAmount / this.sliderMax * 100);
    return 'background: linear-gradient(to right, #50299c, #7a00ff ' + percentage + '%, #d3edff ' + percentage + '%, #dee1e2 100%)';
  }
}
