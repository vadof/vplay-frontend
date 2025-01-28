import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent implements OnInit {

  message: string = 'Page not found';
  statusCode: number = 404;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const {message, statusCode} = params;
      if (message) {
        this.message = message;
      }
      if (statusCode) {
        this.statusCode = statusCode;
      }
    });
  }
}
