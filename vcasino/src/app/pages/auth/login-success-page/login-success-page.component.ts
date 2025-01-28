import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CookieStorage} from "../../../services/cookie-storage.service";

@Component({
  selector: 'app-login-success-page',
  standalone: true,
  imports: [],
  templateUrl: './login-success-page.component.html',
  styleUrl: './login-success-page.component.scss'
})
export class LoginSuccessPageComponent implements OnInit {
  constructor(private route: ActivatedRoute,
              private router: Router,
              private storage: CookieStorage
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const user = {
        name: params['name'],
        username: params['username'],
        email: params['email'],
      };

      if (user.username) {
        this.storage.saveUser(user)
        this.router.navigate([''], {
          replaceUrl: true,
        });
      } else {
        this.router.navigate(['register'], {
          replaceUrl: true,
        });
      }
    });
  }
}
