import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {BehaviorSubject, Observable, take, throwError} from 'rxjs';
import {catchError, filter, switchMap} from 'rxjs/operators';
import {TokenStorageService} from "../../services/token-storage.service";
import {AuthService} from "../../services/auth.service";
import {EventData} from "../../shared/event.class";
import {EventBusService} from "../../shared/event-bus.service";
import {AuthResponse} from "../../models/auth/AuthReposnse";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenStatus: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private storageService: TokenStorageService,
    private authService: AuthService,
    private eventBusService: EventBusService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/auth/')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {

          if (error.status === 401) {

            const token: string | null = this.storageService.getRefreshToken();
            if (token) {
              return this.handle401Error(req, next, token);
            } else {
              this.eventBusService.emit(new EventData('logout', null));
            }

          } else if (error.status === 403) {
            this.eventBusService.emit(new EventData('logout', null));
          }
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, token: string) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenStatus.next(null);

      return this.authService.refreshToken(token).pipe(
        switchMap((res: AuthResponse) => {
          this.isRefreshing = false;
          this.storageService.saveToken(res.token);
          this.refreshTokenStatus.next(res.token);
          return next.handle(this.cloneRequestWithNewToken(request, res.token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.eventBusService.emit(new EventData('logout', null));
          return throwError(() => error);
        })
      );

    } else {
      return this.refreshTokenStatus.pipe(
        filter(token => token),
        take(1),
        switchMap((token) => {
          return next.handle(this.cloneRequestWithNewToken(request, token));
        })
      );
    }
  }

  private cloneRequestWithNewToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true},
];
