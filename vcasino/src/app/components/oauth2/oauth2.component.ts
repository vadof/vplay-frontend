import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-oauth2',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './oauth2.component.html',
  styleUrl: './oauth2.component.scss'
})
export class Oauth2Component implements OnInit {

  errorMessage = '';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.errorMessage = params['oauthError'];
    });
  }

  public loginWithGoogle() {
    window.location.href = environment.GOOGLE_OAUTH2_REDIRECT_URL;
  }

  public loginWithGithub() {
    window.location.href = environment.GITHUB_OAUTH2_REDIRECT_URL;
  }

  public loginWithFacebook() {
    window.location.href = environment.FACEBOOK_OAUTH2_REDIRECT_URL;
  }

  public loginWithDiscord() {
    window.location.href = environment.DISCORD_OAUTH2_REDIRECT_URL;
  }
}
