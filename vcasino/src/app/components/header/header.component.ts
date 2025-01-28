import {Component, Input, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {CookieStorage} from "../../services/cookie-storage.service";
import {IUser} from "../../models/auth/IUser";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  username: string | null = null;
  @Input({required: false}) hideRegisterBtn: boolean = false;
  @Input({required: false}) hideLoginBtn: boolean = false;
  @Input({required: false}) displayUser: boolean = true;

  constructor(
    private cookieStorage: CookieStorage
  ) {
  }

  logout() {
    this.cookieStorage.signOut();
  }

  ngOnInit(): void {
    const user: IUser | null = this.cookieStorage.getUser();
    if (user) {
      this.username = user.username;
    }
  }
}
