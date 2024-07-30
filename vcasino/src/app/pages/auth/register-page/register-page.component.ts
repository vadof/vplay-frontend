import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../../services/auth.service";
import {TokenStorageService} from "../../../services/token-storage.service";

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
export class RegisterPageComponent {
  constructor(
    private authService: AuthService,
    private storage: TokenStorageService,
    private router: Router
  ) {
  }

  errorMessage: string = '';

  registerForm: FormGroup = new FormGroup({
    firstname: new FormControl<string>('', Validators.required),
    lastname: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('',
      [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    password: new FormControl<string>('',
      [Validators.required, Validators.minLength(6)]),
  })

  register(): void {
    if (this.registerForm.valid) {
      const registerRequest = {
        firstname: this.registerForm.value.firstname as string,
        lastname: this.registerForm.value.lastname as string,
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string
      }

      this.authService.register(registerRequest).subscribe(
        {
          next: response => {
            this.storage.saveToken(response.token);
            this.storage.saveUser(response.user);
            this.router.navigate(['']);
          },
          error: error => {
            // TODO handle error
            this.errorMessage = error.error;
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }
}
