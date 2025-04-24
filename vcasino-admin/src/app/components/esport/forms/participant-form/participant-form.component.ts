import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {environment} from "../../../../../environments/environment";
import {HttpService} from "../../../../services/http.service";
import {ErrorService} from "../../../../services/error.service";

@Component({
  selector: 'app-participant-form',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgOptimizedImage
  ],
  templateUrl: './participant-form.component.html',
  styleUrl: './participant-form.component.scss'
})
export class ParticipantFormComponent {
  @Input({required: true}) discipline: string = '';
  @Output() participantAddedEvent: EventEmitter<string> = new EventEmitter<string>();

  participantForm: FormGroup = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    image: new FormControl<string>('', Validators.required),
    participantPage: new FormControl<string>('', Validators.required)
  });

  existingImages: Image[] = [];
  showImages: boolean = false;

  constructor(private http: HttpService,
              private errorService: ErrorService) {
  }

  getExistingImages(): void {
    if (this.existingImages.length > 0) {
      this.showImages = true;
      return;
    }

    this.http.get('/v1/bet/admin/images/participants').then(
      res => {
        const response = res as string[];
        response.forEach(i => this.existingImages.push(
          {name: i, show: false, url: environment.API_URL + '/v1/bet/images/' + i}
        ));
        this.showImages = true;
      },
      err => this.errorService.handleError(err)
    )
  }

  showImage(image: Image): void {
    image.show = true;
    this.participantForm.patchValue({image: image.name});
  }

  addParticipant(): void {
    if (this.participantForm.invalid) {
      this.errorService.showError('Please fill all required fields');
      return;
    }

    const body = {
      name: this.participantForm.value.name as string,
      discipline: this.discipline,
      imageKey: this.participantForm.value.image as string,
      participantPage: this.participantForm.value.participantPage as string
    }

    this.http.post('/v1/bet/admin/participants', body).then(
      () => this.participantAddedEvent.emit(body.name)
      , err => this.errorService.handleError(err)
    )
  }
}

interface Image {
  name: string;
  show: boolean;
  url: string;
}
