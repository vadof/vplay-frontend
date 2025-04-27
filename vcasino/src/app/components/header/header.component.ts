import {Component, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {CookieStorage} from "../../services/cookie-storage.service";
import {IUser} from "../../models/auth/IUser";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {WalletService} from "../../services/wallet.service";
import {NotificationService} from "../../services/notification.service";
import {INotification} from "../../models/INotification";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    RouterLinkActive,
    NgClass,
    NgOptimizedImage,
    NgForOf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | null = null;
  @Input({required: false}) hideRegisterBtn: boolean = false;
  @Input({required: false}) hideLoginBtn: boolean = false;
  @Input({required: false}) displayUser: boolean = true;
  @Input({required: false}) applyMargin: boolean = true;
  sidebarOpen: boolean = false;
  balance: string = '0.00';

  private subscriptions: Subscription = new Subscription();
  notifications: {message: string, fadeOut: boolean}[] = [];

  constructor(
    private cookieStorage: CookieStorage,
    private walletService: WalletService,
    private renderer: Renderer2,
    private notificationService: NotificationService
  ) {
  }

  logout(): void {
    this.cookieStorage.signOut();
    this.notificationService.stopListening();
  }

  ngOnInit(): void {
    const user: IUser | null = this.cookieStorage.getUser();
    if (user) {
      this.username = user.username;

      this.subscriptions.add(
        this.walletService.balance$.subscribe((updatedBalance: number) => {
          this.balance = updatedBalance.toFixed(2);
        })
      );

      this.subscriptions.add(
        this.notificationService.notifications$.subscribe((notification: INotification) => {
          this.handleNotification(notification);
        })
      )

      this.walletService.initBalance();

      this.notificationService.startListening()
      this.displayUser = true;
    } else {
      this.notificationService.stopListening();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleNotification(notification: INotification) {
    if (notification.type === null) return;
    const obj = {message: notification.message, fadeOut: false};

    setTimeout(() => {
      const index: number = this.notifications.indexOf(obj);
      if (index !== -1) {
        obj.fadeOut = true;

        setTimeout(() => {
          this.notifications.splice(index, 1);
        }, 500);
      }
    }, 10000);

    this.notifications.push(obj);
  }

  closeNotification(notification: { message: string; fadeOut: boolean }) {
    const index: number = this.notifications.indexOf(notification);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      this.renderer.addClass(document.body, 'no-scroll');
    } else {
      this.renderer.removeClass(document.body, 'no-scroll');
    }
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideMenu = target.closest('.sidebar') || target.closest('.burger-menu');

    if (!isInsideMenu) {
      this.closeSidebar();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 768 && this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.renderer.removeClass(document.body, 'no-scroll');
  }
}
