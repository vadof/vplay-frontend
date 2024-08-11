import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {TokenStorageService} from "../../services/token-storage.service";
import {AuthService} from "../../services/auth.service";
import {EventData} from "../../shared/event.class";
import {EventBusService} from "../../shared/event-bus.service";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private storageService: TokenStorageService,
    private authService: AuthService,
    private eventBusService: EventBusService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      withCredentials: true,
    });

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      const token: string | null = this.storageService.getRefreshToken();

      if (token) {
        return this.authService.refreshToken(token).pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            console.log(response)

            if (response && response.token) {
              this.storageService.saveToken(response.token);
              this.storageService.saveRefreshToken(response.refreshToken);
            }

            return next.handle(
              request.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              })
            );
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error.status == '403') {
              this.eventBusService.emit(new EventData('logout', null));
            }

            return throwError(() => error);
          })
        );
      } else {
        this.eventBusService.emit(new EventData('logout', null));
      }
    }

    return next.handle(request);
  }
}

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true},
];
