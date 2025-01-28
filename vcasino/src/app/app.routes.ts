import { Routes } from '@angular/router';
import {LoginPageComponent} from "./pages/auth/login-page/login-page.component";
import {RegisterPageComponent} from "./pages/auth/register-page/register-page.component";
import {MainPageComponent} from "./pages/main-page/main-page.component";
import {authGuard} from "./helpers/auth/auth.guard";
import {ClickerPageComponent} from "./pages/clicker-page/clicker-page.component";
import {LoginSuccessPageComponent} from "./pages/auth/login-success-page/login-success-page.component";
import {ConfirmationPageComponent} from "./pages/auth/confirmation-page/confirmation-page.component";
import {ErrorPageComponent} from "./pages/error-page/error-page.component";

export const routes: Routes = [
  {path: 'error', component: ErrorPageComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'login/success', component: LoginSuccessPageComponent},
  {path: 'register', component: RegisterPageComponent},
  {path: 'register/confirmation', component: ConfirmationPageComponent},
  {path: '', component: MainPageComponent},
  {path: 'clicker', component: ClickerPageComponent, canActivate: [authGuard]},
];
