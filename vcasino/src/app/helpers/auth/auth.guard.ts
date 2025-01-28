import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {CookieStorage} from "../../services/cookie-storage.service";

export const authGuard: CanActivateFn = (route, state) => {
  const cookieStorage: CookieStorage = inject(CookieStorage);
  const router: Router = inject(Router);

  if (!cookieStorage.getRefreshToken()) {
    router.navigate(['login']);
    return false;
  }

  return true;
};
