import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {HeaderComponent} from "../../components/header/header.component";
import {NgForOf, NgIf} from "@angular/common";
import {HttpService} from "../../services/http.service";
import {ErrorService} from "../../services/error.service";
import {TournamentSidebarComponent} from "../../components/esport/tournament/tournament-sidebar.component";
import {ITournament} from "../../models/esport/ITournament";
import {
  MatchOverviewSliderComponent
} from "../../components/esport/match-overview-slider/match-overview-slider.component";
import {BetInfoComponent} from "../../components/esport/bet-info/bet-info.component";
import {IMatch} from "../../models/esport/IMatch";
import {ISelectedMarket} from "../../models/esport/ISelectedMarket";
import {MatchesComponent} from "../../components/esport/matches/matches.component";
import {MatchComponent} from "../../components/esport/match/match.component";
import {environment} from "../../../environments/environment";
import {WebSocketService} from "../../services/web-socket.service";
import {IMarket} from "../../models/esport/IMarket";
import {IMatchUpdate} from "../../models/esport/IMatchUpdate";
import {WalletService} from "../../services/wallet.service";
import {BetHistoryComponent} from "../../components/esport/bet-history/bet-history.component";

@Component({
  selector: 'app-e-sport-page',
  standalone: true,
  imports: [
    ErrorPopupComponent,
    HeaderComponent,
    NgIf,
    TournamentSidebarComponent,
    MatchOverviewSliderComponent,
    BetInfoComponent,
    NgForOf,
    MatchesComponent,
    MatchComponent,
    BetHistoryComponent
  ],
  templateUrl: './e-sport-page.component.html',
  styleUrl: './e-sport-page.component.scss'
})
// TODO check for UTC date
export class ESportPageComponent implements OnInit, OnDestroy {
  @ViewChild(BetInfoComponent) betInfoComponent!: BetInfoComponent;

  errorMessage: string = '';
  showBetInfoMobile: boolean = false;

  matchesByTitle: { title: string, matches: IMatch[] }[] = [];
  selectedMarket: ISelectedMarket | null = null;
  balance: number = 0;
  formattedBalance: string = '0.00';

  selectedMatch: IMatch | null = null;

  showTournamentSidebar: boolean = false;
  showBetHistory: boolean = false;

  tournaments: ITournament[] = [];
  matches: IMatch[] = [];

  private marketsById: Map<number, IMarket> = new Map<number, IMarket>();
  private matchDateIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private http: HttpService,
    private webSocket: WebSocketService,
    private walletService: WalletService,
    private errorService: ErrorService
  ) {
    this.walletService.balance$.subscribe((updatedBalance: number) => {
      this.balance = updatedBalance;
      this.formattedBalance = this.balance.toFixed(2);
    });
    this.errorService.error$.subscribe((message: string) => this.errorMessage = message);
  }

  ngOnInit() {
    this.webSocket.subscribeToMarketUpdates();
    this.webSocket.matchUpdate$.subscribe((matchUpdate: IMatchUpdate) => {
      this.handleMatchUpdate(matchUpdate);
    })

    this.http.get('/v1/bet/matches').then(
      res => {
        this.tournaments = res as ITournament[];
        this.tournaments.forEach(t => {
          t.image = environment.API_URL + '/v1/bet/images/' + t.image;

          t.matches.forEach(m => {
            m.tournament = t;
            m.participant1.image = environment.API_URL + '/v1/bet/images/' + m.participant1.image;
            m.participant2.image = environment.API_URL + '/v1/bet/images/' + m.participant2.image;
            this.matches.push(m);
            this.setMatchDate(m);

            m.winnerMatchMarkets.markets.forEach(market => this.marketsById.set(market.id, market));
          });
        });

        this.filterMatchesDefault();
        this.webSocket.subscribeToMarketUpdates();

        const now: Date = new Date();
        const msUntilNextMinute: number = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        setTimeout(() => {
          this.matches.forEach(m => this.setMatchDate(m));

          this.matchDateIntervalId = setInterval(() => {
            this.matches.forEach(m => this.setMatchDate(m));
          }, 60000);
        }, msUntilNextMinute);

      }, err => this.errorService.handleError(err));
    document.body.style.overflowY = 'hidden';
  }

  ngOnDestroy() {
    this.webSocket.unsubscribe();
    if (this.matchDateIntervalId) clearInterval(this.matchDateIntervalId);
    document.body.style.overflowY = 'auto';
  }

  clearError() {
    this.errorMessage = '';
  }

  private setMatchDate(match: IMatch): void {
    const now: Date = new Date();
    const matchDate: Date = new Date(match.startDate * 1000);

    const diffInMs: number = matchDate.getTime() - now.getTime();
    const diffInMinutes: number = Math.floor(diffInMs / 60000);
    const diffInHours: number = Math.floor(diffInMinutes / 60);
    const diffInRemainingMinutes: number = diffInMinutes % 60;

    if (diffInMinutes <= 0) {
      match.dateText = 'LIVE';
      return;
    }

    if (diffInMinutes < 120) {
      if (diffInHours < 1) {
        match.dateText = `Live in ${diffInRemainingMinutes} min`
      } else {
        match.dateText = `Live in ${diffInHours}h ${diffInRemainingMinutes}min`;
      }
      return;
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    match.dateText = matchDate.toLocaleString('en-US', options).replace(',', '');
  }

  filterMatchesDefault() {
    const group: { [discipline: string]: IMatch[] } = {};

    this.tournaments.forEach(t => {
      if (!group[t.discipline]) {
        group[t.discipline] = [];
      }
      t.matches.forEach(m => group[t.discipline].push(m));
    })

    this.matchesByTitle = Object.keys(group).map(key => ({
      title: key,
      matches: group[key]
    }));
  }

  filterMatchesByTournament(tournament: ITournament | null) {
    this.selectedMatch = null;
    if (tournament === null) {
      this.filterMatchesDefault();
    } else {
      const foundTournament: ITournament | undefined = this.tournaments.find(t => t.id === tournament.id);
      const tournamentMatches: IMatch[] = foundTournament ? foundTournament.matches : [];
      this.matchesByTitle = [{title: `${tournament.discipline}. ${tournament.title}`, matches: tournamentMatches}];
    }
  }

  filterMatchesByDiscipline(discipline: string | null) {
    this.selectedMatch = null;
    if (discipline === null) {
      this.filterMatchesDefault();
    } else {
      const tournamentMatches: IMatch[] = [];
      this.tournaments.filter(t => t.discipline === discipline).forEach(
        t => t.matches.forEach(m => tournamentMatches.push(m)));
      this.matchesByTitle = [{title: discipline, matches: tournamentMatches}];
    }
  }

  toggleTournamentSidebar(show: boolean) {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    this.showTournamentSidebar = show;
  }

  selectMatch(match: IMatch | null) {
    this.selectedMatch = match;
  }

  selectMarket(selectedMarket: ISelectedMarket | null) {
    this.selectedMarket = selectedMarket;
  }

  private handleMatchUpdate(matchUpdate: IMatchUpdate) {
    if (matchUpdate.ended) {
      this.matches = this.matches.filter(m => m.id !== matchUpdate.matchId);
      this.matchesByTitle.forEach(i => {
        i.matches = i.matches.filter(m => m.id !== matchUpdate.matchId);
      });
      if (this.selectedMatch !== null && this.selectedMatch.id === matchUpdate.matchId) {
        this.selectMatch(null);
      }
      return;
    }

    if (matchUpdate.matchMaps !== null) {
      const match: IMatch | undefined = this.matches.find(m => m.id === matchUpdate.matchId);
      if (match) {
        match.matchMaps = matchUpdate.matchMaps;
      }
    }

    if (matchUpdate.winnerMatchMarkets !== null) {
      this.updateWinnerMatchMarkets(matchUpdate.winnerMatchMarkets);
    }
  }

  private updateWinnerMatchMarkets(markets: IMarket[]) {
    markets.forEach(m => {
      const existingMarket: IMarket | undefined = this.marketsById.get(m.id);
      if (existingMarket) {
        this.updateMarket({toUpdate: existingMarket, updateWith: m});
      }
    })
  }

  updateMarket(obj: { toUpdate: IMarket, updateWith: IMarket }) {
    const oldOdds: number = obj.toUpdate.odds;
    obj.toUpdate.odds = obj.updateWith.odds;
    obj.toUpdate.closed = obj.updateWith.closed;

    if (!obj.toUpdate.closed) {
      obj.toUpdate.oddsIncreased = obj.toUpdate.odds > oldOdds;
      setTimeout(() => {
        obj.toUpdate.oddsIncreased = undefined;
      }, 2000);
    }

    if (this.selectedMarket !== null && this.selectedMarket.market.id === obj.toUpdate.id) {
      if (this.selectedMarket!.market.closed) {
        this.selectMarket(null);
      } else {
        this.betInfoComponent.updatePossibleWin();
      }
    }
  }
}
