import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../../services/auth.service";
import {TokenStorageService} from "../../../services/token-storage.service";
import {ErrorResponse} from "../../../models/auth/ErrorResponse";
import {ICountry} from "../../../models/auth/ICountry";

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent implements OnInit {

  registerForm: FormGroup = new FormGroup({
    firstname: new FormControl<string>('', Validators.required),
    lastname: new FormControl<string>('', Validators.required),
    username: new FormControl<string>('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]*$')]),
    country: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('',
      [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
  });

  countries: ICountry[] = [];

  constructor(
    private authService: AuthService,
    private storage: TokenStorageService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authService.getCountries().subscribe({
      next: value => this.countries = value,
      error: err => {
        const error: ErrorResponse = err.error as ErrorResponse;
        this.errorMessage = error.message;
      }
    });
  }

  errorMessage: string = '';

  register(): void {
    if (this.registerForm.valid) {
      const selectedCountry: string = this.registerForm.value.country as string;
      const registerRequest = {
        firstname: this.registerForm.value.firstname as string,
        lastname: this.registerForm.value.lastname as string,
        username: this.registerForm.value.username as string,
        email: this.registerForm.value.email as string,
        country: this.countries.find(c => c.code === selectedCountry),
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
      if (this.registerForm.controls.country.errors?.['required']) {
        this.registerForm.controls.country.errors.notSelected = true;
      }

      this.errorMessage = 'Fill in the empty fields!';
    }
  }
}
