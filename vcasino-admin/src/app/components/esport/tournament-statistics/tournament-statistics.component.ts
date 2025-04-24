import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {ITournamentStatistics} from "../../../models/esport/ITournamentStatistics";
import {ITournament} from "../../../models/esport/ITournament";
import {environment} from "../../../../environments/environment";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {GeneralStatisticsComponent} from "../general-statistics/general-statistics.component";
import {MainStatisticsComponent} from "../../main-statistics/main-statistics.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {MatchFormComponent} from "../forms/match-form/match-form.component";
import {TournamentFormComponent} from "../forms/tournament-form/tournament-form.component";

@Component({
  selector: 'app-tournament-statistics',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    GeneralStatisticsComponent,
    MainStatisticsComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatchFormComponent,
    TournamentFormComponent
  ],
  templateUrl: './tournament-statistics.component.html',
  styleUrl: './tournament-statistics.component.scss'
})
export class TournamentStatisticsComponent implements OnInit {
  @Output() showTournamentMatchesEvent: EventEmitter<number> = new EventEmitter<number>;
  show: boolean = false;

  filterForm: FormGroup = new FormGroup({
    startDate: new FormControl<string>(this.getFormattedDate(null, -14)),
    endDate: new FormControl<string | null>(null)
  });

  tournaments: { tournament: ITournament, stats: { label: string, value: number }[], showStats: boolean }[] = [];
  showTournamentForm: boolean = false;

  selectedTournamentForMatch: ITournament | null = null;

  constructor(private http: HttpService,
              private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.getTournaments();
  }

  getTournaments(): void {
    let startDate: string = this.filterForm.value.startDate as string;
    let endDate: string = this.filterForm.value.endDate as string;

    if (!startDate) {
      startDate = this.getFormattedDate(null, -14);
      this.filterForm.patchValue({startDate});
    }

    let url: string = `/v1/bet/admin/statistics/tournaments?startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    this.http.get(url).then(
      res => {
        this.tournaments = [];
        const stats: ITournamentStatistics[] = res as ITournamentStatistics[];
        stats.forEach(s => {
          this.tournaments.push(
            {
              tournament: {
                id: s.tournamentId,
                title: s.title,
                discipline: s.discipline.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-'),
                image: `${environment.API_URL}/v1/bet/images/${s.image}`,
                startDate: s.startDate.split(' ')[0],
                endDate: s.endDate.split(' ')[0],
                page: s.tournamentPage
              },
              stats: [
                {label: 'Matches', value: s.matchCount ? s.matchCount : 0},
                {label: 'Total Bets', value: s.betCount ? s.betCount : 0},
                {label: 'Amount Wagered', value: s.totalAmountWagered ? s.totalAmountWagered : 0},
                {label: 'WIN amount', value: s.totalAmountWin ? s.totalAmountWin : 0},
                {label: 'LOSS amount', value: s.totalAmountLoss ? s.totalAmountLoss : 0},
                {label: 'Profit', value: s.profit ? s.profit : 0}
              ],
              showStats: false
            }
          )
        });

        this.show = true;
      },
      err => this.errorService.handleError(err)
    );
  }

  private getFormattedDate(date: Date | null, plusDays: number): string {
    if (date === null) {
      date = new Date();
    }
    date.setDate(date.getDate() + plusDays);
    return date.toISOString().split('T')[0]
  }

  openMatchForm(tournament: ITournament): void {
    this.selectedTournamentForMatch = tournament;
  }

  goToMatches(tournament: ITournament): void {
    this.showTournamentMatchesEvent.emit(tournament.id);
  }

  handleMatchAddedEvent(event: ITournament): void {
    const obj = this.tournaments.find(t => t.tournament.id === event.id);
    if (obj) obj.stats[0].value++;
    this.selectedTournamentForMatch = null;
  }

  onTournamentAdded(event: { startDate: string; endDate: string }) {
    this.filterForm.patchValue({startDate: event.startDate});
    this.filterForm.patchValue({endDate: event.endDate});

    this.showTournamentForm = false;
    this.getTournaments();
  }
}
