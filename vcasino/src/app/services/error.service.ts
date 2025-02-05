import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {getMessageFromError} from "../utils/global-utils";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private router: Router) {
  }

  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();

  handleError(err: any) {
    if (err.status === 503) {
      this.router.navigate(['/error'], {
        queryParams: {
          message: 'Service Unavailable',
          statusCode: err.status
        },
      });
    } else {
      this.errorSubject.next(getMessageFromError(err));
    }
  }
}
