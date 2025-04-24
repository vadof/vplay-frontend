import {Component, EventEmitter, Output} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {HttpService} from "../../../../services/http.service";
import {ErrorService} from "../../../../services/error.service";

@Component({
  selector: 'app-tournament-form',
  standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgOptimizedImage,
        ReactiveFormsModule
    ],
  templateUrl: './tournament-form.component.html',
  styleUrl: './tournament-form.component.scss'
})
export class TournamentFormComponent {

  existingImages: Image[] = [];
  @Output() tournamentAddedEvent: EventEmitter<{startDate: string, endDate: string}>
    = new EventEmitter<{startDate: string, endDate: string}>();

  tournamentForm: FormGroup = new FormGroup({
    title: new FormControl<string>('', Validators.required),
    discipline: new FormControl<string>('Counter-Strike', Validators.required),
    image: new FormControl<string>('', Validators.required),
    tournamentPage: new FormControl<string>('', Validators.required),
    startDate: new FormControl<string>('', Validators.required),
    endDate: new FormControl<string>('', Validators.required),
  });

  constructor(private http: HttpService,
              private errorService: ErrorService) {
  }

  getExistingImages(): void {
    this.existingImages = [];
    this.http.get('/v1/bet/admin/images/tournaments').then(
      res => {
        const response = res as string[];
        response.forEach(i => this.existingImages.push(
          {name: i, show: false, url: environment.API_URL + '/v1/bet/images/' + i}
        ));
      },
      err => this.errorService.handleError(err)
    )
  }

  showImage(image: Image): void {
    image.show = true;
    this.tournamentForm.patchValue({image: image.name});
  }

  addTournament(): void {
    if (this.tournamentForm.invalid) {
      this.errorService.showError('Please fill all required fields');
      return;
    }

    const body = {
      title: this.tournamentForm.value.title as string,
      discipline: this.tournamentForm.value.discipline as string,
      tournamentPage: this.tournamentForm.value.tournamentPage as string,
      imageKey: this.tournamentForm.value.image as string,
      startDate: this.tournamentForm.value.startDate as string + 'T00:00:00',
      endDate: this.tournamentForm.value.endDate as string + 'T00:00:00'
    }

    this.http.post('/v1/bet/admin/tournaments', body).then(
      () => {
        this.existingImages = [];
        this.tournamentForm.reset();

        this.tournamentAddedEvent.emit({
          startDate: body.startDate.split('T')[0],
            endDate: body.endDate.split('T')[0]
        })

      }, err => this.errorService.handleError(err)
    )
  }

}

interface Image {
  name: string;
  show: boolean;
  url: string;
}
