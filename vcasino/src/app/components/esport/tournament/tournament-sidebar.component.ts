import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ITournament} from "../../../models/esport/ITournament";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-tournament-sidebar',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgIf,
    NgClass
  ],
  templateUrl: './tournament-sidebar.component.html',
  styleUrl: './tournament-sidebar.component.scss'
})
export class TournamentSidebarComponent implements OnInit {
  @Input({required: true}) tournaments: ITournament[] = [];
  @Output() selectTournamentEvent: EventEmitter<ITournament | null> = new EventEmitter<ITournament | null>();
  @Output() selectDisciplineEvent: EventEmitter<string | null> = new EventEmitter<string | null>();
  @Output() closeSidebarEvent: EventEmitter<null> = new EventEmitter<null>();

  selectedTournamentId: number = 0;
  selectedDiscipline: string = '';
  disciplineTournaments: IDisciplineTournament[] = [];

  ngOnInit(): void {
    const grouped: { [key: string]: ITournament[] } = {};

    this.tournaments.forEach(tournament => {
      if (!grouped[tournament.discipline]) {
        grouped[tournament.discipline] = [];
      }
      grouped[tournament.discipline].push(tournament);
    });

    this.disciplineTournaments = Object.entries(grouped).map(([discipline, tournaments]) => {
      return {
        discipline,
        image: `esport/${discipline}.webp`,
        tournaments,
        opened: false
      };
    });
  }

  selectTournament(tournament: ITournament) {
    this.selectedDiscipline = '';

    if (this.selectedTournamentId === tournament.id) {
      this.selectedTournamentId = 0;
      this.selectTournamentEvent.emit(null);
    } else {
      this.selectedTournamentId = tournament.id;
      this.selectTournamentEvent.emit(tournament);
    }
    this.closeSidebarEvent.emit();
  }

  selectDiscipline(discipline: string) {
    this.selectedTournamentId = 0;

    if (this.selectedDiscipline === discipline) {
      this.selectedDiscipline = '';
      this.selectDisciplineEvent.emit(null);
    } else {
      this.selectedDiscipline = discipline;
      this.selectDisciplineEvent.emit(discipline);
    }
    this.closeSidebarEvent.emit();
  }

  openCloseDiscipline(discipline: IDisciplineTournament) {
    discipline.opened = !discipline.opened;
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }
}

interface IDisciplineTournament {
  discipline: string;
  image: string;
  tournaments: ITournament[];
  opened: boolean;
}
