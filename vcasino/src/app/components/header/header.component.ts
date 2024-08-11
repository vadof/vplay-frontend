import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {TokenStorageService} from "../../services/token-storage.service";
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
export class HeaderComponent {
  username: string | null = null;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
  }

  logout() {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const user: IUser | null = this.tokenStorage.getUser();
    if (user) {
      this.username = user.username;
    }
  }
}
