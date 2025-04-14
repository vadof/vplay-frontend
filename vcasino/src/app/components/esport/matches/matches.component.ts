import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IMatch} from "../../../models/esport/IMatch";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";
import {IMarket} from "../../../models/esport/IMarket";
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {ITournament} from "../../../models/esport/ITournament";

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss'
})
export class MatchesComponent {
  @Input({required: true}) matches: IMatch[] = [];
  @Input({required: true}) selectedMarket: ISelectedMarket | null = null;
  @Output() selectTournamentEvent: EventEmitter<ITournament> = new EventEmitter<ITournament>;
  @Output() selectMatchEvent: EventEmitter<IMatch> = new EventEmitter<IMatch>;
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;

  selectMarket(market: IMarket, match: IMatch) {
    if (this.selectedMarket !== null && this.selectedMarket.market.id === market.id) {
      this.selectedMarket = null;
    } else {
      this.selectedMarket = {market, match};
    }
    this.selectMarketEvent.emit(this.selectedMarket);
  }

  selectTournament(tournament: ITournament) {
    this.selectTournamentEvent.emit(tournament);
  }

  selectMatch(match: IMatch) {
    this.selectMatchEvent.emit(match);
  }
}
