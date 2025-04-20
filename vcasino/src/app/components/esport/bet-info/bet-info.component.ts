import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {NgIf, NgOptimizedImage, NgSwitch, NgSwitchCase} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";
import {BetHistoryComponent} from "../bet-history/bet-history.component";
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {IBetResponse} from "../../../models/esport/IBetResponse";
import {WalletService} from "../../../services/wallet.service";

@Component({
  selector: 'app-bet-info',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    FormsModule,
    BetHistoryComponent,
    NgSwitchCase,
    NgSwitch
  ],
  templateUrl: './bet-info.component.html',
  styleUrl: './bet-info.component.scss'
})
export class BetInfoComponent implements OnInit, OnChanges {
  @Input({required: true}) opened: boolean = false;
  @Input({required: false}) selectedMarket: ISelectedMarket | null = null;
  @Input({required: true}) balance: number = 0.0;
  @Output() showBetHistoryEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;

  formattedBalance: string = '0.00';
  marketInfo: MarketInfo | null = null;
  betAmount: number = 0;
  possibleWin: number = 0;
  acceptOddsChanges: boolean = false;
  marketChanged: boolean = true;

  betButtonState: number = 0;
  betErrorMessage: string = '';

  constructor(private http: HttpService,
              private errorService: ErrorService,
              private walletService: WalletService
  ) {}


  ngOnInit() {
    this.initMarketInfo();
  }

  ngOnChanges() {
    this.initMarketInfo();
  }

  private initMarketInfo() {
    this.betButtonState = 0;
    this.marketChanged = true;

    this.marketInfo = null;
    this.formattedBalance = this.balance.toFixed(2);

    if (this.selectedMarket !== null) {

      const marketType: string = this.selectedMarket.market.type;
      const p1Image: string = this.selectedMarket.match.participant1.image;
      const p2Image: string = this.selectedMarket.match.participant2.image;

      let image: string = '';

      if (marketType === 'WinnerMatch' || marketType === 'WinnerMap') {
        image = this.selectedMarket.market.outcome === 1 ? p1Image : p2Image;
      } else if (marketType === 'TotalMaps' || 'TotalMapRounds') {
        image = 'esport/' + this.selectedMarket.match.tournament.discipline + '.webp';
      } else if (marketType === 'HandicapMaps') {
        image = this.selectedMarket.market.participant === 1 ? p1Image : p2Image;
      }

      this.marketInfo = {
        participantsText: `${this.selectedMarket.match.participant1.name} vs ${this.selectedMarket.match.participant2.name}`,
        description: this.selectedMarket.marketCategory,
        image: image,
        outcome: this.selectedMarket.market.outcomeStr
      }

      if (this.balance >= 1) {
        this.betAmount = 1.00;
        this.possibleWin = Math.floor(this.betAmount * this.selectedMarket.market.odds * 100) / 100;
      }
    }
  }

  selectBetAmount(percent: number): void {
    this.betErrorMessage = '';
    this.betAmount = parseFloat((this.balance * percent).toFixed(2));
  }

  onBetAmountChange(value: string): void {
    this.betErrorMessage = '';

    let numericValue: number = parseFloat(value);
    if (isNaN(numericValue)) {
      return;
    }

    numericValue = Math.ceil(Math.min(numericValue, this.balance) * 100) / 100

    if (numericValue !== 0 && numericValue < 0.1) {
      numericValue = 0.1;
    }

    if (numericValue >= this.balance) {
      numericValue = this.balance;
    }

    this.betAmount = numericValue;
    this.possibleWin = Math.floor(this.betAmount * this.selectedMarket!.market.odds * 100) / 100;
  }

  removeSelectedMarket() {
    this.selectedMarket = null;
    this.marketInfo = null;
    this.selectMarketEvent.emit(this.selectedMarket);
  }

  placeBet() {
    this.betErrorMessage = '';

    if (this.betButtonState > 0 || this.selectedMarket === null || this.betAmount < 0.1) return;
    this.marketChanged = false;

    const body = {
      marketId: this.selectedMarket.market.id,
      odds: this.selectedMarket.market.odds,
      amount: this.betAmount,
      acceptAllOddsChanges: this.acceptOddsChanges
    }

    this.betButtonState = 1;
    this.http.post('/v1/bet/place', body).then(
      res => {
        const response: IBetResponse = res as IBetResponse;
        this.handleBetSuccessResponse(response);
      },
      err => {
        this.betButtonState = 0;
        this.errorService.handleError(err)
      });
  }

  private handleBetSuccessResponse(response: IBetResponse): void {
    if (response.betPlaced) {
      if (!this.marketChanged) this.betButtonState = 2

      setTimeout(() => {
        if (!this.marketChanged) {
          this.removeSelectedMarket();
          this.betButtonState = 0;
          if (this.opened) {
            this.togglePopup();
          }
        }

        this.walletService.setBalance(response.updatedBalance);
      }, 500);
    } else if (!this.marketChanged) {
      this.betButtonState = 0;
      this.betErrorMessage = response.reason;
    }
  }

  showBetHistory(): void {
    this.showBetHistoryEvent.emit(true);
  }

  public updatePossibleWin() {
    this.possibleWin = Math.floor(this.betAmount * this.selectedMarket!.market.odds * 100) / 100;
  }

  togglePopup(): void {
    this.opened = !this.opened;
    if (this.opened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}

interface MarketInfo {
  participantsText: string;
  image: string;
  outcome: string;
  description: string;
}
