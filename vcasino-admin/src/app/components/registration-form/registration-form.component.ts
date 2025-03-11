import {Component, EventEmitter, Output} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {HttpService} from "../../services/http.service";
import {ErrorResponse} from "../../models/auth/ErrorResponse";

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss'
})
export class RegistrationFormComponent {
  errorMessage: string = '';
  @Output() registeredAdminUsername: EventEmitter<string> = new EventEmitter<string>();

  constructor(private http: HttpService) {
  }

  registerForm: FormGroup = new FormGroup({
    name: new FormControl<string>('', Validators.maxLength(100)),
    username: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(16),
      Validators.pattern('^[a-zA-Z0-9_]*$')
    ]),
    email: new FormControl<string>('', [
      Validators.required,
      Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
    ]),
    password: new FormControl<string>('', passwordValidator()),
  });

  register(): void {
    if (this.registerForm.valid) {
      const body = {
        name: this.registerForm.value.name as string,
        username: this.registerForm.value.username as string,
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string
      }

      this.http.post('/v1/users/auth/admin/register', body).then(
        () => {
          this.registeredAdminUsername.emit(body.username);
          this.registerForm.reset();
        },
        err => this.errorMessage = (err.error as ErrorResponse).message
      );
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }
}

function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;

    const errors: any = {};

    if (!password) {
      errors.required = "Password cannot be empty";
      return errors;
    }

    if (password.length < 12) {
      errors.minLength = `Password min length is 12`;
    }

    const validCharactersRegex: RegExp = /^[\u0020-\u007E]+$/;
    const specialSymbolRegex: RegExp = /[!-/:-@[-`{-~ ]/;
    const capitalLetterRegex: RegExp = /[A-Z]/;
    const numberRegex: RegExp = /[0-9]/;

    const invalidCharacters = [...password].filter(
      (char) => !validCharactersRegex.test(char)
    );
    if (invalidCharacters.length > 0) {
      errors.invalidCharacters = `Password contains invalid characters: ${invalidCharacters.join('')}`;
    }

    if (!specialSymbolRegex.test(password)) {
      errors.noSpecialSymbol = 'Password must contain at least one special symbol';
    }

    if (!capitalLetterRegex.test(password)) {
      errors.noCapitalLetter = 'Password must contain at least one capital letter';
    }

    if (!numberRegex.test(password)) {
      errors.noNumber = 'Password must contain at least one number';
    }

    return Object.keys(errors).length ? errors : null;
  };
}
