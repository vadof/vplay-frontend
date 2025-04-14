import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";

@Component({
  selector: 'app-bet-info',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    FormsModule
  ],
  templateUrl: './bet-info.component.html',
  styleUrl: './bet-info.component.scss'
})
export class BetInfoComponent implements OnInit, OnChanges {
  @Input({required: true}) opened: boolean = false;
  @Input({required: false}) selectedMarket: ISelectedMarket | null = null;
  @Input({required: false}) balance: number | null = 3.45;
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;

  marketInfo: MarketInfo | null = null;
  betAmount: number = 0;
  possibleWin: number = 0;
  acceptOddsChanges: boolean = false;

  // TODO
  showBets: boolean = false;

  ngOnInit() {
    this.initMarketInfo();
  }

  ngOnChanges() {
    this.initMarketInfo();
  }

  private initMarketInfo() {
    this.marketInfo = null;

    if (this.selectedMarket !== null) {

      const marketType: string = this.selectedMarket.market.type;
      const p1Name: string = this.selectedMarket.match.participant1.name;
      const p1Image: string = this.selectedMarket.match.participant1.image;
      const p2Name: string = this.selectedMarket.match.participant2.name;
      const p2Image: string = this.selectedMarket.match.participant2.image;

      let image: string = '';
      let outcome: string = '';

      if (marketType === 'WinnerMatch' || marketType === 'WinnerMap') {
        outcome = this.selectedMarket.market.outcome === 1 ? p1Name : p2Name;
        image = this.selectedMarket.market.outcome === 1 ? p1Image : p2Image;
      } else if (marketType === 'TotalMaps' || 'TotalMapRounds') {
        outcome = this.selectedMarket.market.outcome < 0 ? 'Under ' : 'Over ';
        outcome += Math.abs(this.selectedMarket.market.outcome);
        image = 'esport/' + this.selectedMarket.match.tournament.discipline;
      } else if (marketType === 'HandicapMaps') {
        outcome = this.selectedMarket.market.participant === 1 ? p1Name : p2Name;
        image = this.selectedMarket.market.participant === 1 ? p1Image : p2Image;
      }

      this.marketInfo = {
        participantsText: `${this.selectedMarket.match.participant1.name} vs ${this.selectedMarket.match.participant2.name}`,
        description: this.selectedMarket.market.description,
        image: image,
        outcome: outcome
      }

      if (this.balance !== null && this.balance >= 1) {
        this.betAmount = 1.00;
        this.possibleWin = Math.floor(this.betAmount * this.selectedMarket.market.odds * 100) / 100;
      }
    }
  }

  selectBetAmount(percent: number): void {
    this.betAmount = parseFloat((this.balance! * percent).toFixed(2));
  }

  onBetAmountChange(value: string) {
    let numericValue = parseFloat(value);

    if (isNaN(numericValue)) {
      return;
    }

    numericValue = Math.ceil(Math.min(numericValue, this.balance!) * 100) / 100

    if (numericValue !== 0 && numericValue < 0.1) {
      numericValue = 0.1;
    }

    if (numericValue >= this.balance!) {
      numericValue = this.balance!;
    }

    this.betAmount = numericValue;
    this.possibleWin = Math.floor(this.betAmount * this.selectedMarket!.market.odds * 100) / 100;
  }

  removeSelectedMarket() {
    this.selectedMarket = null;
    this.marketInfo = null;
    this.selectMarketEvent.emit(this.selectedMarket);
  }

  // TODO
  placeBet() {

  }

  togglePopup() {
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
