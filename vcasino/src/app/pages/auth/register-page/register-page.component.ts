import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {TokenStorageService} from "../../../services/token-storage.service";
import {ErrorResponse} from "../../../models/auth/ErrorResponse";
import {Oauth2Component} from "../../../components/oauth2/oauth2.component";

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    Oauth2Component
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {

  registerForm: FormGroup = new FormGroup({
    firstName: new FormControl<string>(''),
    middleName: new FormControl<string>(''),
    lastName: new FormControl<string>(''),
    username: new FormControl<string>('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]*$')]),
    email: new FormControl<string>('',
      [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(
    private authService: AuthService,
    private storage: TokenStorageService,
    private router: Router,
  ) {
  }

  errorMessage: string = '';

  register(): void {
    if (this.registerForm.valid) {
      const registerRequest = {
        firstName: this.registerForm.value.firstName as string,
        lastName: this.registerForm.value.lastName as string,
        username: this.registerForm.value.username as string,
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string
      }

      this.authService.register(registerRequest).subscribe(
        {
          next: value => {
            this.storage.saveToken(value.token);
            this.storage.saveUser(value.user);
            this.router.navigate(['']);
          },
          error: error => {
            let errorResponse: ErrorResponse = error.error as ErrorResponse;
            this.errorMessage = errorResponse.message;
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }
}
