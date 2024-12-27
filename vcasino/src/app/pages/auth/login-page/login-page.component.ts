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
      username: new FormControl<string>('', Validators.required),
      password: new FormControl<string>('', Validators.required)
    })
  }

  public errorMessage: string = ''

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
          next: value => {
            this.storage.saveToken(value.token);
            this.storage.saveRefreshToken(value.refreshToken);
            this.storage.saveUser(value.user);
            this.router.navigate(['']);
          },
          error: () => {
            this.errorMessage = 'Invalid Username or Password!';
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!'
    }
  }
}
