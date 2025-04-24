import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {HttpService} from "../../../../services/http.service";
import {ITournament} from "../../../../models/esport/ITournament";
import {ErrorService} from "../../../../services/error.service";
import {convertLocalToUTC} from "../../../../utils/global-utils";
import {ParticipantFormComponent} from "../participant-form/participant-form.component";

@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    ReactiveFormsModule,
    ParticipantFormComponent
  ],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.scss'
})
export class MatchFormComponent {
  @Input({required: true}) tournament!: ITournament;
  @Output() matchAddedEvent: EventEmitter<ITournament> = new EventEmitter<ITournament>();

  participants: string[] = [];
  showParticipants: boolean = false;
  showParticipantForm: boolean = false;

  private setNameForFirst: boolean = true;

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  matchForm: FormGroup = new FormGroup({
    matchPage: new FormControl<string>('', Validators.required),
    participant1: new FormControl<string>('', Validators.required),
    participant2: new FormControl<string>('', Validators.required),
    format: new FormControl<string>('BO3', Validators.required),
    winProbability1: new FormControl<number>(50, Validators.required),
    startDate: new FormControl<string>('', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)])
  });

  get progressBackground(): string {
    const value: number = this.matchForm.value.winProbability1 as number;
    const percentage: number = ((value - 10) / (90 - 10)) * 100;
    return `background: linear-gradient(to right, #57C785, #6DC757 ${percentage}%, #d3edff ${percentage}%, #dee1e2 100%)`;
  }

  getParticipants(): void {
    if (this.participants.length > 0) {
      this.showParticipants = true;
    } else {
      this.http.get(`/v1/bet/admin/participants?discipline=${this.tournament.discipline}`).then(
        res => {
          this.participants = res as string[];
          this.showParticipants = true;
        },
        err => this.errorService.handleError(err));
    }
  }

  selectParticipant(participant: string): void {
    if (this.setNameForFirst) this.matchForm.patchValue({ participant1: participant });
    else this.matchForm.patchValue({ participant2: participant });
    this.setNameForFirst = !this.setNameForFirst;
  }

  addMatch(): void {
    if (this.matchForm.invalid) {
      this.errorService.showError('Please fill all required fields');
      return;
    }

    const body =  {
      tournamentId: this.tournament.id,
      matchPage: this.matchForm.value.matchPage as string,
      participant1: this.matchForm.value.participant1 as string,
      participant2: this.matchForm.value.participant2 as string,
      format: this.matchForm.value.format as string,
      winProbability1: (this.matchForm.value.winProbability1 as number) / 100,
      winProbability2: (100 - this.matchForm.value.winProbability1 as number) / 100,
      startDate: convertLocalToUTC((this.matchForm.value.startDate as string)).replace(' ', 'T')
    }

    this.http.post('/v1/bet/admin/matches', body).then(
      () => {
        this.matchAddedEvent.emit(this.tournament);
      }, err => this.errorService.handleError(err)
    )
  }

  openParticipantForm(): void {
    this.showParticipantForm = true;
    this.showParticipants = false;
  }

  closeParticipantForm(addedParticipant: string | null): void {
    this.showParticipantForm = false;
    this.showParticipants = false;
    if (addedParticipant !== null && this.participants.length > 0) {
      this.participants.push(addedParticipant);
    }
  }
}
