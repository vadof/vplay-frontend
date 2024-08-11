import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {TokenStorageService} from "../../services/token-storage.service";

export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorageService: TokenStorageService = inject(TokenStorageService);
  const router: Router = inject(Router);

  if (tokenStorageService.getToken() === null) {
    router.navigate(['login']);
    return false;
  }

  return true;
};
