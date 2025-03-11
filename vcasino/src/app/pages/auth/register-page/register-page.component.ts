import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {CookieStorage} from "../../../services/cookie-storage.service";
import {ErrorResponse} from "../../../models/auth/ErrorResponse";
import {Oauth2Component} from "../../../components/oauth2/oauth2.component";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {HeaderComponent} from "../../../components/header/header.component";
import {IEmailSendingOptions} from "../../../models/auth/IEmailSendingOptions";
import {finalize} from "rxjs";

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    Oauth2Component,
    HeaderComponent,
    NgOptimizedImage
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  registerForm: FormGroup = new FormGroup({
    name: new FormControl<string>('', [
      Validators.maxLength(100)
    ]),
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
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8)
    ]),
  });

  emailOptions: IEmailSendingOptions | null = null;
  tokenCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  errorMessage: string = '';
  emailIntervalId: ReturnType<typeof setInterval> | null = null;
  resendIn: number = 0;

  constructor(
    private authService: AuthService,
    private storage: CookieStorage,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.storage.signOut(false);
  }

  ngOnDestroy(): void {
    this.clearIntervals();
  }

  private clearIntervals(): void {
    if (this.tokenCheckIntervalId) clearInterval(this.tokenCheckIntervalId);
    if (this.emailIntervalId) clearInterval(this.emailIntervalId);
  }

  register(): void {
    if (this.registerForm.valid) {
      const registerRequest = {
        name: this.registerForm.value.name as string,
        username: this.registerForm.value.username as string,
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string
      }

      this.authService.register(registerRequest).subscribe(
        {
          next: res => {
            this.emailOptions = res;
            this.errorMessage = '';
            this.setEmailInterval();
            this.waitForToken();
          },
          error: error => {
            this.errorMessage = (error.error as ErrorResponse).message;
          }
        })
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }

  private waitForToken() {
    this.tokenCheckIntervalId = setInterval(() => {
      if (this.storage.getToken()) {
        this.router.navigate(['']);
      }
    }, 5000);
  }

  sendEmailAgain() {
    this.authService.resendEmail(this.emailOptions).subscribe({
      next: res => {
        this.emailOptions = res;
        this.setEmailInterval();
      },
      error: err => this.errorMessage = (err.error as ErrorResponse).message
    });
  }

  private setEmailInterval() {
    if (this.emailOptions && this.emailOptions.canResend) {
      this.resendIn = this.emailOptions.emailsSent * 30;
      this.emailIntervalId = setInterval(() => {
        if (this.resendIn === 0) {
          clearInterval(this.emailIntervalId!);
        } else {
          this.resendIn--;
        }
      }, 1000);
    }
  }

  goBack() {
    this.authService.deletePendingUser(this.emailOptions).pipe(
      finalize(() => {
        this.emailOptions = null;
        this.errorMessage = '';
        this.clearIntervals();
      })
    ).subscribe();
  }
}
