import { Routes } from '@angular/router';
import {ErrorPageComponent} from "./pages/error-page/error-page.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {authGuard} from "./helpers/auth/auth.guard";
import {MainPageComponent} from "./pages/main-page/main-page.component";

export const routes: Routes = [
  {path: 'error', component: ErrorPageComponent},
  {path: 'login', component: LoginPageComponent},
  {path: '', component: MainPageComponent, canActivate: [authGuard]},
];
