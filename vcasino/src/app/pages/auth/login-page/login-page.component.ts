import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common"
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {TokenStorageService} from "../../../services/token-storage.service";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: TokenStorageService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl<string>('', Validators.required),
      password: new FormControl<string>('', Validators.required)
    })
  }

  public errorMessage: string = ''

  login(): void {
    if (this.loginForm.valid) {
      const email: string = this.loginForm.value.email as string;
      const password: string = this.loginForm.value.password as string;

      const loginRequest = {
        email,
        password
      }

      this.authService.login(loginRequest).subscribe(
        {
          next: response => {
            this.storage.saveToken(response.token);
            this.storage.saveRefreshToken(response.refreshToken);
            this.storage.saveUser(response.user);
            this.router.navigate(['']);
          },
          error: error => {
            // TODO HANDLE ERROR PROPERLY
            this.errorMessage = 'Invalid Email or Password!';
            this.loginForm.reset();
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!'
    }
  }
}
