import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IMatch} from "../../../models/esport/IMatch";
import {IMarket} from "../../../models/esport/IMarket";
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    NgClass
  ],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit {
  @Input({required: true}) match!: IMatch;
  @Input({required: true}) selectedMarket: ISelectedMarket | null = null;
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;
  @Output() selectMatchEvent: EventEmitter<null> = new EventEmitter<null>;

  marketCategories: string[] = ['All markets', 'Winner', 'Total', 'Handicap'];
  marketTypesByCategory: Map<string, string[]> = new Map<string, string[]>();

  selectedMarketCategory: string = '';

  markets: IMarket[] = [
    {id: 1, outcome: 1, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '2.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 2, outcome: 2, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},

    {id: 3, outcome: 2.5, outcomeStr: 'Over 2.5', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'TotalMaps', description: 'Total Maps', oddsIncreased: undefined},
    {id: 4, outcome: -2.5, outcomeStr: 'Under 2.5', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'TotalMaps', description: 'Total Maps', oddsIncreased: undefined},

    {id: 5, outcome: 18.5, outcomeStr: '18.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},
    {id: 6, outcome: -18.5, outcomeStr: '-18.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},

    {id: 7, outcome: 19.5, outcomeStr: 'Over 19.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},
    {id: 8, outcome: -19.5, outcomeStr: 'Under 19.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},

    {id: 9, outcome: 20.5, outcomeStr: 'Over 20.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},
    {id: 10, outcome: -20.5, outcomeStr: 'Under 20.5', odds: 1.90, oddsStr: '1.90', closed: false, mapNumber: 1, participant: null, type: 'TotalMapRounds', description: 'Total. Map 1', oddsIncreased: undefined},

    {id: 11, outcome: 1, outcomeStr: 'Spirit', odds: 1.50, oddsStr: '1.50', closed: false, mapNumber: 1, participant: null, type: 'WinnerMap', description: 'Winner. Map 1', oddsIncreased: undefined},
    {id: 12, outcome: 2, outcomeStr: 'Vitality', odds: 2.35, oddsStr: '2.35', closed: false, mapNumber: 1, participant: null, type: 'WinnerMap', description: 'Winner. Map 1', oddsIncreased: undefined},

    {id: 13, outcome: 1, outcomeStr: 'Spirit', odds: 1.50, oddsStr: '1.50', closed: false, mapNumber: 2, participant: null, type: 'WinnerMap', description: 'Winner. Map 2', oddsIncreased: undefined},
    {id: 14, outcome: 2, outcomeStr: 'Vitality', odds: 2.35, oddsStr: '2.35', closed: false, mapNumber: 2, participant: null, type: 'WinnerMap', description: 'Winner. Map 2', oddsIncreased: undefined},

    {id: 15, outcome: 1, outcomeStr: 'Spirit', odds: 1.50, oddsStr: '1.50', closed: false, mapNumber: 3, participant: null, type: 'WinnerMap', description: 'Winner. Map 3', oddsIncreased: undefined},
    {id: 16, outcome: 2, outcomeStr: 'Vitality', odds: 2.35, oddsStr: '2.35', closed: false, mapNumber: 3, participant: null, type: 'WinnerMap', description: 'Winner. Map 3', oddsIncreased: undefined},

    {id: 17, outcome: 1.5, outcomeStr: 'Spirit +1.5', odds: 1.50, oddsStr: '1.50', closed: false, mapNumber: 3, participant: 1, type: 'Handicap', description: 'Maps Handicap', oddsIncreased: undefined},
    {id: 18, outcome: -1.5, outcomeStr: 'Vitality -1.5', odds: 2.30, oddsStr: '2.30', closed: false, mapNumber: 3, participant: 2, type: 'Handicap', description: 'Maps Handicap', oddsIncreased: undefined},

    {id: 19, outcome: 1.5, outcomeStr: 'Vitality +1.5', odds: 1.27, oddsStr: '1.27', closed: false, mapNumber: 3, participant: 2, type: 'Handicap', description: 'Maps Handicap', oddsIncreased: undefined},
    {id: 20, outcome: -1.5, outcomeStr: 'Spirit -1.5', odds: 4.47, oddsStr: '4.47', closed: false, mapNumber: 3, participant: 1, type: 'Handicap', description: 'Maps Handicap', oddsIncreased: undefined}
  ];

  marketsByTypes: MarketsByCategory[] = [
    {category: 'Match Winner', marketPairs: [[this.markets[0], this.markets[1]]]},
    {category: 'Winner. Map 1', marketPairs: [[this.markets[10], this.markets[11]]]},
    {category: 'Winner. Map 2', marketPairs: [[this.markets[12], this.markets[13]]]},
    {category: 'Winner. Map 3', marketPairs: [[this.markets[14], this.markets[15]]]},
    {category: 'Total Maps', marketPairs: [[this.markets[2], this.markets[3]]]},
    {category: 'Total. Map 1', marketPairs: [[this.markets[4], this.markets[5]], [this.markets[6], this.markets[7]], [this.markets[8], this.markets[9]]]},
    {category: 'Handicap Maps', marketPairs: [[this.markets[16], this.markets[17]], [this.markets[18], this.markets[19]]]},
  ];

  marketsToShow: MarketsByCategory[] = []

  ngOnInit() {
    this.marketTypesByCategory.set('Winner', ['Match Winner', 'Winner. Map 1', 'Winner. Map 2', 'Winner. Map 3']);
    this.marketTypesByCategory.set('Total', ['Total Maps', 'Total. Map 1']);
    this.marketTypesByCategory.set('Handicap', ['Total Maps', 'Maps Handicap']);

    this.selectMarketCategory('All markets');
  }

  private sortByType(marketType: string) {
    if (marketType === 'All markets') {
      this.marketsToShow = this.marketsByTypes;
    } else if (marketType === 'Winner') {
      this.marketsToShow = this.marketsByTypes.filter(m => m.category.includes('Winner'));
    } else if (marketType === 'Total') {
      this.marketsToShow = this.marketsByTypes.filter(m => m.category.includes('Total'));
    } else if (marketType === 'Handicap') {
      this.marketsToShow = this.marketsByTypes.filter(m => m.category.includes('Handicap'));
    }
  }

  selectMarketCategory(category: string) {
    if (category !== this.selectedMarketCategory) {
      this.selectedMarketCategory = category;
      this.marketsToShow = [];
      this.sortByType(category);
    }
  }

  selectMarket(market: IMarket) {
    if (this.selectedMarket !== null && this.selectedMarket.market.id === market.id) {
      this.selectedMarket = null;
    } else {
      this.selectedMarket = {market, match: this.match};
    }
    this.selectMarketEvent.emit(this.selectedMarket);
  }

  backToMatches() {
    this.selectMatchEvent.emit(null);
  }
}

interface MarketsByCategory {
  category: string;
  marketPairs: IMarket[][];
}
