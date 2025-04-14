import {Component, OnInit} from '@angular/core';
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
import {IMarket} from "../../models/esport/IMarket";
import {IMatch} from "../../models/esport/IMatch";
import {ISelectedMarket} from "../../models/esport/ISelectedMarket";
import {MatchesComponent} from "../../components/esport/matches/matches.component";
import {MatchComponent} from "../../components/esport/match/match.component";

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
    MatchComponent
  ],
  templateUrl: './e-sport-page.component.html',
  styleUrl: './e-sport-page.component.scss'
})
export class ESportPageComponent implements OnInit {
  errorMessage: string = '';
  showBetInfoMobile: boolean = false;

  tournaments: ITournament[] = [
    {id: 1, image: 'esport/blast-bounty.webp', discipline: 'Counter-Strike', title: 'PGL Astana'},
    {id: 2, image: 'esport/blast-bounty.webp', discipline: 'Counter-Strike', title: 'PGL Astana'},
    {id: 3, image: 'esport/blast-bounty.webp', discipline: 'Counter-Strike', title: 'PGL Wallachia Season 34'},
    {id: 4, image: 'esport/blast-bounty.webp', discipline: 'Dota 2', title: 'PGL Astana'},
    {id: 5, image: 'esport/blast-bounty.webp', discipline: 'Dota 2', title: 'PGL Wallachia Season 34'}
  ];

  markets: IMarket[] = [
    {id: 1, outcome: 1.0, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '2.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 2, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 3, outcome: 1.0, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '2.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 4, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 5, outcome: 1.0, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '2.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 6, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 7, outcome: 1.0, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 8, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 9, outcome: 1.0, outcomeStr: 'Spirit', odds: 2.50, oddsStr: '2.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 10, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.47, oddsStr: '1.47', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 11, outcome: 1.0, outcomeStr: 'Spirit', odds: 3.50, oddsStr: '3.50', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
    {id: 12, outcome: 2.0, outcomeStr: 'Vitality', odds: 1.27, oddsStr: '1.27', closed: false, mapNumber: null, participant: null, type: 'WinnerMatch', description: 'Match Winner', oddsIncreased: undefined},
  ]

  matches: IMatch[] = [
    {id: 1, tournament: this.tournaments[0], participant1: {name: 'Spirit', image: 'esport/Spirit.png'}, participant2: {name: 'Vitality', image: 'esport/Vitality.png'}, winnerMatchMarket1: this.markets[0], winnerMatchMarket2: this.markets[1], startDate: '2025-04-10T23:30:00'},
    {id: 2, tournament: this.tournaments[0], participant1: {name: 'Spirit2', image: 'esport/Spirit.png'}, participant2: {name: 'Vitality', image: 'esport/Vitality.png'}, winnerMatchMarket1: this.markets[2], winnerMatchMarket2: this.markets[3], startDate: '2025-04-10T23:30:00'},
    {id: 3, tournament: this.tournaments[1], participant1: {name: 'Vitality3', image: 'esport/Vitality.png'}, participant2: {name: 'Spirit', image: 'esport/Spirit.png'}, winnerMatchMarket1: this.markets[4], winnerMatchMarket2: this.markets[5], startDate: '2025-04-10T23:30:00'},
    {id: 4, tournament: this.tournaments[1], participant1: {name: 'Spirit4', image: 'esport/Spirit.png'}, participant2: {name: 'Vitality', image: 'esport/Vitality.png'}, winnerMatchMarket1: this.markets[6], winnerMatchMarket2: this.markets[7], startDate: '2025-04-10T23:30:00'},
    {id: 5, tournament: this.tournaments[3], participant1: {name: 'Spirit5', image: 'esport/Spirit.png'}, participant2: {name: 'Vitality', image: 'esport/Vitality.png'}, winnerMatchMarket1: this.markets[8], winnerMatchMarket2: this.markets[9], startDate: '2025-04-10T23:30:00'},
    {id: 5, tournament: this.tournaments[4], participant1: {name: 'Spirit', image: 'esport/Spirit.png'}, participant2: {name: 'Vitality', image: 'esport/Vitality.png'}, winnerMatchMarket1: this.markets[10], winnerMatchMarket2: this.markets[11], startDate: '2025-04-10T23:30:00'}
  ];

  matchesByTitle: {title: string, matches: IMatch[]}[] = [];
  selectedMarket: ISelectedMarket | null = null;

  selectedMatch: IMatch | null = null;

  showTournamentSidebar: boolean = false;

  constructor(
    private http: HttpService,
    private errorService: ErrorService
  ) {
    this.errorService.error$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  ngOnInit() {
    this.filterMatchesDefault();
  }

  clearError() {
    this.errorMessage = '';
  }

  filterMatchesDefault() {
    const group: { [discipline: string]: IMatch[] } = {};

    for (const match of this.matches) {
      if (!group[match.tournament.discipline]) {
        group[match.tournament.discipline] = [];
      }
      group[match.tournament.discipline].push(match);
    }

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
      const tournamentMatches: IMatch[] = this.matches.filter(m => m.tournament.id === tournament.id);
      this.matchesByTitle = [{title: `${tournament.discipline}. ${tournament.title}`, matches: tournamentMatches}];
    }
  }

  filterMatchesByDiscipline(discipline: string | null) {
    this.selectedMatch = null;
    if (discipline === null) {
      this.filterMatchesDefault();
    } else {
      const tournamentMatches: IMatch[] = this.matches.filter(m => m.tournament.discipline === discipline);
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
}
