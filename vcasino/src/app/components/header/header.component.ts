import {Component, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {CookieStorage} from "../../services/cookie-storage.service";
import {IUser} from "../../models/auth/IUser";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {WalletService} from "../../services/wallet.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    RouterLinkActive,
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  username: string | null = null;
  @Input({required: false}) hideRegisterBtn: boolean = false;
  @Input({required: false}) hideLoginBtn: boolean = false;
  @Input({required: false}) displayUser: boolean = true;
  sidebarOpen: boolean = false;
  balance: string = '0.00';

  constructor(
    private cookieStorage: CookieStorage,
    private walletService: WalletService,
    private renderer: Renderer2
  ) {
  }

  logout() {
    this.cookieStorage.signOut();
  }

  ngOnInit(): void {
    const user: IUser | null = this.cookieStorage.getUser();
    if (user) {
      this.username = user.username;
      this.walletService.balance$.subscribe((updatedBalance) => {
        this.balance = updatedBalance.toFixed(2);
      });
      this.walletService.initBalance();

      this.displayUser = true;
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
