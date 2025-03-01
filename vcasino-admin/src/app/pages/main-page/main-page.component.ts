import {Component, OnInit} from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {HttpService} from "../../services/http.service";
import {IUserStatistics} from "../../models/user/IUserStatistics";
import {ErrorService} from "../../services/error.service";
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {NgForOf, NgIf} from "@angular/common";
import {IUserInformation} from "../../models/user/IUserInformation";
import {FormsModule} from "@angular/forms";
import {MainStatisticsComponent} from "../../components/main-statistics/main-statistics.component";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    ErrorPopupComponent,
    ErrorPopupComponent,
    NgIf,
    NgForOf,
    FormsModule,
    MainStatisticsComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {

  errorMessage = '';
  userStatistics: { label: string, value: number }[] = [];
  userInformation: { label: string; value: any; clickable?: boolean }[] = [];
  currentUser: string = '';

  searchQuery: string = '';
  searchType: string = 'username';
  searchHistory: string[] = [];

  constructor(private http: HttpService,
              private errorService: ErrorService) {
    this.errorService.error$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  ngOnInit(): void {
    this.http.get('/v1/users/admin/statistics').then(
      res => {
        const userStatistics: IUserStatistics = res as IUserStatistics
        this.userStatistics = [
          { label: 'Total Registered Users', value: userStatistics.registeredUsers },
          { label: 'Users Registered Today', value: userStatistics.registeredUsersToday },
          { label: 'Users Registered Last Week', value: userStatistics.registeredUsersLastWeek },
          { label: 'Users Registered Last Month', value: userStatistics.registeredUsersLastMonth },
          { label: 'Active Users', value: userStatistics.activeUsers },
          { label: 'Users Invited by Others', value: userStatistics.registeredUsersInvitedByOthers },
          { label: 'Users with OAuth', value: userStatistics.registeredUsersWithOAuth },
          { label: 'Frozen Users', value: userStatistics.frozenUsers },
        ];
      },
      err => this.errorService.handleError(err)
    );
  }

  searchUser() {
    if (!this.searchQuery.trim()) {
      this.errorService.handleError("Please enter a value to search.");
      return;
    }

    if (this.searchType === 'username') {
      this.findUserByUsername(this.searchQuery);
    } else if (!/^\d+$/.test(this.searchQuery)) {
      this.errorService.handleError("User ID must be a number.")
    } else {
      this.findUserById(+this.searchQuery);
    }
  }

  findUserByUsername(username: string) {
    if (this.currentUser !== username) {
      this.http.get(`/v1/users/admin/statistics/user?username=${username}`).then(
        res => this.displayUserInformation(res as IUserInformation),
        err => this.errorService.handleError(err)
      );
    }
  }

  private findUserById(id: number) {
    this.http.get(`/v1/users/admin/statistics/user?id=${id}`).then(
      res => this.displayUserInformation(res as IUserInformation),
      err => this.errorService.handleError(err)
    );
  }

  private displayUserInformation(userInformation: IUserInformation) {
    this.currentUser = userInformation.username;
    if (!this.searchHistory.some(u => u === this.currentUser)) {
      this.searchHistory.unshift(userInformation.username);
    }

    const formattedDate = new Date(userInformation.registerDate).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).replace(",", "");

    this.userInformation = [
      { label: 'Name:', value: userInformation.name ? userInformation.name : 'N/A' },
      { label: 'Username:', value: userInformation.username },
      { label: 'Email:', value: userInformation.email },
      { label: 'OAuth Provider:', value: userInformation.oauthProvider ? userInformation.oauthProvider : 'N/A' },
      { label: 'Role:', value: userInformation.role },
      { label: 'Active:', value: userInformation.active ? 'Yes' : 'No' },
      { label: 'Frozen:', value: userInformation.frozen ? 'Yes' : 'No' },
      { label: 'Users Invited:', value: userInformation.usersInvited },
      { label: 'Invited By:', value: userInformation.invitedBy ?? 'N/A', clickable: userInformation.invitedBy !== null },
      { label: 'Register Date:', value: formattedDate }
    ];
  }

  clearError() {
    this.errorMessage = '';
  }

}
