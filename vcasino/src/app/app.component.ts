import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';
import {CookieStorage} from "./services/cookie-storage.service";
import {EventBusService} from "./shared/event-bus.service";
import {NotificationService} from "./services/notification.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  eventBusSub?: Subscription;

  constructor(
    private cookieStorage: CookieStorage,
    private eventBusService: EventBusService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.cookieStorage.signOut();
      this.notificationService.stopListening();
    });
  }

  ngOnDestroy(): void {
    if (this.eventBusSub)
      this.eventBusSub.unsubscribe();
  }
}
