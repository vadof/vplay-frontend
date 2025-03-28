import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {Event, EventSourcePolyfill, MessageEvent} from 'event-source-polyfill';
import {BehaviorSubject, Observable} from "rxjs";
import {CookieStorage} from "./cookie-storage.service";
import {INotification} from "../models/INotification";
import {AuthService} from "./auth.service";

const emptyNotification: INotification = {
  message: '',
  type: null,
  data: null
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationSubject: BehaviorSubject<INotification> = new BehaviorSubject<INotification>(emptyNotification);
  notifications$: Observable<INotification> = this.notificationSubject.asObservable();
  private eventSource: EventSourcePolyfill | null = null;

  constructor(private cookieStorage: CookieStorage,
              private authService: AuthService
  ) {}

  stopListening(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  startListening(): void {
    if (this.eventSource) return;
    const token: string | null = this.cookieStorage.getToken();
    if (!token) return;

    const url: string = `${environment.API_URL.substring(0, environment.API_URL.indexOf('/api'))}/notifications/stream`;
    this.eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      heartbeatTimeout: 300000 // 5 min
    });

    this.eventSource.onmessage = (event: MessageEvent) => {
      const notification: INotification = JSON.parse(event.data) as INotification;
      this.notificationSubject.next(notification);
    };

    this.eventSource.onerror = (error: Event) => {
      // @ts-ignore
      if (error.status === 401) {
        this.stopListening();
        const refreshToken: string | null = this.cookieStorage.getRefreshToken();

        if (refreshToken) {
          this.authService.refreshToken(refreshToken).subscribe({
            next: res => {
              this.cookieStorage.saveToken(res.token);
              this.cookieStorage.saveRefreshToken(res.refreshToken);
              this.startListening();
            }
          })
        }
      }
    }
  }

}
