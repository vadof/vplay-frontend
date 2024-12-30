import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-oauth2',
  standalone: true,
  imports: [],
  templateUrl: './oauth2.component.html',
  styleUrl: './oauth2.component.scss'
})
export class Oauth2Component {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  public loginWithGoogle() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = environment.GOOGLE_OAUTH2_REDIRECT_URL;
    }
  }

  public loginWithGithub() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = environment.GITHUB_OAUTH2_REDIRECT_URL;
    }
  }
}
