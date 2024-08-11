import { Routes } from '@angular/router';
import {LoginPageComponent} from "./pages/auth/login-page/login-page.component";
import {RegisterPageComponent} from "./pages/auth/register-page/register-page.component";
import {MainPageComponent} from "./pages/main-page/main-page.component";
import {authGuard} from "./helpers/auth/auth.guard";
import {ClickerPageComponent} from "./pages/clicker-page/clicker-page.component";

export const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'register', component: RegisterPageComponent},
  {path: '', component: MainPageComponent, canActivate: [authGuard]},
  {path: 'clicker', component: ClickerPageComponent, canActivate: [authGuard]},
];
