import {Component, OnDestroy} from '@angular/core';
import {ErrorService} from "../../services/error.service";
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {FormsModule} from "@angular/forms";
import {HeaderComponent} from "../../components/header/header.component";
import {MainStatisticsComponent} from "../../components/main-statistics/main-statistics.component";
import {NgForOf, NgIf} from "@angular/common";
import {SearchComponent} from "../../components/search/search.component";
import {UserStatisticsComponent} from "../../components/esport/user-statistics/user-statistics.component";
import {GeneralStatisticsComponent} from "../../components/esport/general-statistics/general-statistics.component";
import {TaskStatisticsComponent} from "../../components/clicker/tasks/task-statistics.component";
import {TournamentStatisticsComponent} from "../../components/esport/tournament-statistics/tournament-statistics.component";
import {MatchStatisticsComponent} from "../../components/esport/match-statistics/match-statistics.component";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-e-sport-page',
  standalone: true,
  imports: [
    ErrorPopupComponent,
    FormsModule,
    HeaderComponent,
    MainStatisticsComponent,
    NgForOf,
    NgIf,
    SearchComponent,
    UserStatisticsComponent,
    GeneralStatisticsComponent,
    TaskStatisticsComponent,
    TournamentStatisticsComponent,
    MatchStatisticsComponent
  ],
  templateUrl: './e-sport-page.component.html',
  styleUrl: './e-sport-page.component.scss'
})
export class ESportPageComponent implements OnDestroy {
  errorMessage: string = '';
  section: 'general' | 'tournaments' | 'matches' | 'user' = 'general';
  selectedTournamentId: number | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private errorService: ErrorService) {
    this.subscriptions.add(
      this.errorService.error$.subscribe((message) => {
        this.errorMessage = message;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  switchSection(section: 'general' | 'tournaments' | 'matches' | 'user') {
    this.section = section;
  }

  clearError(): void {
    this.errorMessage = '';
  }

  showTournamentMatches(tournamentId: number): void {
    this.selectedTournamentId = tournamentId;
    this.section = 'matches';
  }
}
