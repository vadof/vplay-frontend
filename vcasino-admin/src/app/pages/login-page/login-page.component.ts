import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common"
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {CookieStorage} from "../../services/cookie-storage.service";
import {HeaderComponent} from "../../components/header/header.component";
import {ErrorResponse} from "../../models/auth/ErrorResponse";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

  errorMessage: string = ''

  loginForm: FormGroup = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: CookieStorage
  ) {}

  login(): void {
    if (this.loginForm.valid) {
      const username: string = this.loginForm.value.username as string;
      const password: string = this.loginForm.value.password as string;

      const loginRequest = {
        username: username,
        password: password
      }

      this.authService.login(loginRequest).subscribe(
        {
          next: res => {
            if (this.isAdminRole(res.token)) {
              this.storage.saveAuthResponse(res, 'ADMIN');
              this.router.navigate(['']);
            } else {
              this.errorMessage = 'Invalid Username or Password!'
            }
          },
          error: err => {
            if (err.error) {
              this.errorMessage = (err.error as ErrorResponse).message;
            } else {
              this.errorMessage = 'Invalid Username or Password!';
            }
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!'
    }
  }

  private isAdminRole(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      return (JSON.parse(atob(payload)).roles as string[]).some(r => r === 'ROLE_ADMIN');
    } catch (error) {
      return false;
    }
  }
}
