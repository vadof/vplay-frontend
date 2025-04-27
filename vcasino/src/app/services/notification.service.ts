import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {Observable, Subject} from "rxjs";
import {CookieStorage} from "./cookie-storage.service";
import {INotification} from "../models/INotification";
import {AuthService} from "./auth.service";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {v4 as uuidv4} from 'uuid';
import {WalletService} from "./wallet.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private stompClient: Client | null = null;
  private readonly wsUrl: string = environment.NOTIFICATIONS_WEBSOCKET_URL;

  private notificationSubscription: StompSubscription | null = null;
  private notificationSubject: Subject<INotification> = new Subject<INotification>();
  notifications$: Observable<INotification> = this.notificationSubject.asObservable();

  private pingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private cookieStorage: CookieStorage,
              private authService: AuthService,
              private walletService: WalletService
  ) {
  }

  startListening(): void {
    if (this.stompClient !== null) return;

    setTimeout(() => {
      const token: string | null = this.cookieStorage.getToken();
      if (!token) return;

      const topicId: string = uuidv4();

      this.stompClient = new Client({
        brokerURL: this.wsUrl,
        connectHeaders: {'Authorization': `Bearer ${token}`, topicId},
        reconnectDelay: 15000,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
        onConnect: (): void => {
          this.subscribeToNotificationsTopic(topicId);
          this.setPings();
        },
        onDisconnect: () => {
          if (this.pingIntervalId !== null) {
            clearInterval(this.pingIntervalId);
            this.pingIntervalId = null;
          }
        }
      });

      this.stompClient.activate();
    }, 2000)
  }

  private subscribeToNotificationsTopic(topicId: string): void {
    this.notificationSubscription = this.stompClient!.subscribe(`/topic/notifications/${topicId}`, (message: IMessage) => {
      const notification: INotification = JSON.parse(message.body) as INotification;
      if (notification.type === 'ERROR') {
        this.handleError();
      } else {
        if (notification.type === 'BALANCE') {
          this.walletService.setBalance(notification.data);
        }

        this.notificationSubject.next(notification);
      }

    });
  }

  handleError(): void {
    this.stopListening();
    const refreshToken: string | null = this.cookieStorage.getRefreshToken();
    if (refreshToken) {
      this.authService.refreshToken(refreshToken).subscribe(
        {
          next: res => {
            this.cookieStorage.saveToken(res.token);
            this.cookieStorage.saveRefreshToken(res.refreshToken);
            this.startListening();
          },
          error: error => {
            console.log("Unable to subscribe to notifications")
          }
        });
    }
  }

  stopListening(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.forceDisconnect();
      this.stompClient = null;
    }
  }

  private setPings(): void {
    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
    }

    this.pingIntervalId = setInterval(() => {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.publish({
          destination: '/app/ping',
          body: JSON.stringify({timestamp: Date.now()})
        });
      }
    }, 10000);
  }
}
