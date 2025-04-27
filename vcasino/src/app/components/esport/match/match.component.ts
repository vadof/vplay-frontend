import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IMatch} from "../../../models/esport/IMatch";
import {IMarket} from "../../../models/esport/IMarket";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";
import {IMarketsByCategory} from "../../../models/esport/IMarketsByCategory";
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {WebSocketService} from "../../../services/web-socket.service";
import {IMarketPair} from "../../../models/esport/IMarketPair";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit, OnDestroy {
  @Input({required: true}) match!: IMatch;
  @Input({required: true}) selectedMarket: ISelectedMarket | null = null;
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;
  @Output() selectMatchEvent: EventEmitter<null> = new EventEmitter<null>;
  @Output() updateMarketEvent: EventEmitter<{ toUpdate: IMarket, updateWith: IMarket, pair: IMarketPair }> = new EventEmitter<{
    toUpdate: IMarket,
    updateWith: IMarket,
    pair: IMarketPair
  }>;
  private subscriptions: Subscription = new Subscription();

  marketCategories: string[] = ['All markets', 'Winner', 'Total', 'Handicap'];

  selectedMarketCategory: string = '';

  marketsByCategory: IMarketsByCategory[] = [];
  marketsToShowCategory: IMarketsByCategory[] = [];
  marketsToShow: IMarketsByCategory[] = [];
  private marketPairsById: Map<number, IMarketPair> = new Map<number, IMarketPair>();

  constructor(private http: HttpService,
              private webSocket: WebSocketService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.http.get(`/v1/bet/matches/${this.match.id}`)
      .then(res => {
        this.marketsByCategory = res as IMarketsByCategory[];
        this.selectMarketCategory('All markets');

        this.marketsByCategory.forEach(i => {
          i.marketPairs.forEach(pair => {
            pair.markets.forEach(m => this.marketPairsById.set(m.id, pair));
          });
        });

      }, err => this.errorService.handleError(err));

    this.webSocket.subscribeToMatchMarkets(this.match.id);
    this.subscriptions.add(
      this.webSocket.matchMarkets$.subscribe((markets: IMarket[]) => {
        this.updateMarkets(markets);
      })
    );
  }

  ngOnDestroy() {
    this.webSocket.unsubscribeFromMatchMarkets();
    this.subscriptions.unsubscribe();
  }

  private sortByType(marketType: string) {
    if (marketType === 'All markets') {
      this.marketsToShowCategory = this.marketsByCategory;
    } else if (marketType === 'Winner') {
      this.marketsToShowCategory = this.marketsByCategory.filter(m => m.category.includes('Winner'));
    } else if (marketType === 'Total') {
      this.marketsToShowCategory = this.marketsByCategory.filter(m => m.category.includes('Total'));
    } else if (marketType === 'Handicap') {
      this.marketsToShowCategory = this.marketsByCategory.filter(m => m.category.includes('Handicap'));
    }
    this.setClosedState();
  }

  private setClosedState(): void {
    this.marketsToShowCategory.forEach(i => {
      let atLeastOneOpened: boolean = false;
      i.marketPairs.forEach(p => {
        if (!p.closed) atLeastOneOpened = true;
      });

      i.allClosed = !atLeastOneOpened;
    });

    this.marketsToShow = this.marketsToShowCategory.filter(i => !i.allClosed);
  }

  selectMarketCategory(category: string) {
    if (category !== this.selectedMarketCategory) {
      this.selectedMarketCategory = category;
      this.marketsToShow = [];
      this.sortByType(category);
    }
  }

  selectMarket(market: IMarket, category: string) {
    if (this.selectedMarket !== null && this.selectedMarket.market.id === market.id) {
      this.selectedMarket = null;
    } else {
      this.selectedMarket = {market, match: this.match, marketCategory: category};
    }
    this.selectMarketEvent.emit(this.selectedMarket);
  }

  private updateMarkets(markets: IMarket[]) {
    markets.forEach(m => {
      const marketPair: IMarketPair | undefined = this.marketPairsById.get(m.id);
      if (marketPair) {
        const existingMarket: IMarket | undefined = marketPair.markets.find(mp => mp.id === m.id);
        if (existingMarket) {
          this.updateMarketEvent.emit({toUpdate: existingMarket, updateWith: m, pair: marketPair});
        }
      }
    });
    this.setClosedState();
  }

  backToMatches() {
    this.selectMarketEvent.emit(null);
    this.selectMatchEvent.emit(null);
  }
}
