import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {CookieStorage} from "../../../services/cookie-storage.service";
import {ErrorResponse} from "../../../models/auth/ErrorResponse";
import {NgIf} from "@angular/common";
import {Oauth2Component} from "../../../components/oauth2/oauth2.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [
    NgIf,
    Oauth2Component,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.scss'
})
export class ConfirmationPageComponent implements OnInit {
  constructor(private route: ActivatedRoute,
              private router: Router,
              private storage: CookieStorage,
              private authService: AuthService
  ) {
  }

  confirmationType: string = '';
  errorMessage: string = '';

  usernameForm: FormGroup = new FormGroup({
    username: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(16),
      Validators.pattern('^[a-zA-Z0-9_]*$')
    ]),
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.confirmationType = params['type'];

      if (this.confirmationType === 'username') {
        this.handleUsernameConfirmation(params['username'])
      } else if (this.confirmationType === 'email') {
        this.handleEmailConfirmation(params['confirmationToken'])
      } else {
        this.navigateToMainPage();
      }
    });
  }

  private handleUsernameConfirmation(username: string | null): void {
    if (username) {
      this.usernameForm.setValue({username: username});
    }
  }

  private handleEmailConfirmation(confirmationToken: string | null): void {
    if (confirmationToken) {

      this.authService.confirmEmailRegistration({confirmationToken}).subscribe({
        next: res => {
          this.storage.saveAuthResponse(res);
          this.navigateToMainPage();
        }, error: err => {
          this.router.navigate(['/error'], {
            queryParams: {
              message: 'The link is no longer active',
              statusCode: err.status
            },
            replaceUrl: true
          });
        }
      })

    } else {
      this.storage.removeReferral();
      this.router.navigate([''], {
        replaceUrl: true,
      });
    }
  }

  proceedUsernameConfirmation(): void {
    if (this.usernameForm.valid) {
      const confirmationRequest = {
        username: this.usernameForm.value.username as string,
      }

      this.authService.confirmUsernameRegistration(confirmationRequest).subscribe(
        {
          next: res => {
            this.storage.saveAuthResponse(res);
            this.navigateToMainPage();
          },
          error: error => {
            this.errorMessage = (error.error as ErrorResponse).message;
          }
        });
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }

  private navigateToMainPage(): void {
    this.router.navigate([''], {
      replaceUrl: true,
    });
  }
}
