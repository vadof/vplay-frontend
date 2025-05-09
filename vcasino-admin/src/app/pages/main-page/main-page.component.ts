import {Component, OnDestroy, OnInit} from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {HttpService} from "../../services/http.service";
import {IUserStatistics} from "../../models/user/IUserStatistics";
import {ErrorService} from "../../services/error.service";
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {NgForOf, NgIf} from "@angular/common";
import {IUserInformation} from "../../models/user/IUserInformation";
import {FormsModule} from "@angular/forms";
import {MainStatisticsComponent} from "../../components/main-statistics/main-statistics.component";
import {SearchComponent} from "../../components/search/search.component";
import {RegistrationFormComponent} from "../../components/registration-form/registration-form.component";
import {IRegistrationStatistics} from "../../models/user/IRegistrationStatistics";
import {IUserGeneralStatistics} from "../../models/user/IUserGeneralStatistics";
import {Subscription} from "rxjs";

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
    MainStatisticsComponent,
    SearchComponent,
    RegistrationFormComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();

  errorMessage = '';
  userStatistics: { label: string, value: number }[] = [];
  registrationStatistics: IRegistrationStatistics[] = [];
  userInformation: { label: string; value: any; clickable?: boolean }[] = [];
  currentUserInformation: IUserInformation | undefined;
  searchHistory: IUserInformation[] = [];

  searchOptions: {label: string, type: 'string' | 'number'}[] =  [
    {label: 'ID', type: 'number'},
    {label: 'Username', type: 'string'},
  ];

  showRegistrationForm: boolean = false;

  constructor(private http: HttpService,
              private errorService: ErrorService) {
    this.subscriptions.add(
      this.errorService.error$.subscribe((message) => {
        this.errorMessage = message;
      })
    );
  }

  ngOnInit(): void {
    this.http.get('/v1/users/admin/statistics').then(
      res => {
        const userStatistics: IUserStatistics = res as IUserStatistics;
        const generalStatistics: IUserGeneralStatistics = userStatistics.generalStatistics;
        this.registrationStatistics = userStatistics.registrationStatistics;
        this.userStatistics = [
          {label: 'Total Registered Users', value: generalStatistics.registeredUsers},
          {label: 'Users Registered Today', value: generalStatistics.registeredUsersToday},
          {label: 'Users Registered Last Week', value: generalStatistics.registeredUsersLastWeek},
          {label: 'Users Registered Last Month', value: generalStatistics.registeredUsersLastMonth},
          {label: 'Active Users', value: generalStatistics.activeUsers},
          {label: 'Users Invited by Others', value: generalStatistics.registeredUsersInvitedByOthers},
          {label: 'Users with OAuth', value: generalStatistics.registeredUsersWithOAuth},
          {label: 'Frozen Users', value: generalStatistics.frozenUsers},
        ];
      },
      err => this.errorService.handleError(err)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  searchUser(searchOutput: {option: string, value: string}) {
    if (searchOutput.option === "Username") {
      this.findUserByUsername(searchOutput.value);
    } else {
      this.findUserById(+searchOutput.value);
    }
  }

  findUserByUsername(username: string) {
    if (this.currentUserInformation === undefined || this.currentUserInformation.username !== username) {

      const existingInformation = this.searchHistory.find(ui => ui.username === username);
      if (existingInformation) {
        this.displayUserInformation(existingInformation);
      } else {
        this.http.get(`/v1/users/admin/statistics/user?username=${username}`).then(
          res => this.displayUserInformation(res as IUserInformation),
          err => this.errorService.handleError(err)
        );
      }
    }
  }

  private findUserById(id: number) {
    if (this.currentUserInformation === undefined || this.currentUserInformation.id !== id) {

      const existingInformation = this.searchHistory.find(ui => ui.id === id);
      if (existingInformation) {
        this.displayUserInformation(existingInformation);
      } else {
        this.http.get(`/v1/users/admin/statistics/user?id=${id}`).then(
          res => this.displayUserInformation(res as IUserInformation),
          err => this.errorService.handleError(err)
        );
      }
    }
  }

  private displayUserInformation(userInformation: IUserInformation) {
    if (this.currentUserInformation === undefined
      || !this.searchHistory.some(u => u.username === userInformation.username)) {
      this.searchHistory.unshift(userInformation);
    }

    this.currentUserInformation = userInformation;

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
      {label: 'ID', value: userInformation.id},
      {label: 'Name:', value: userInformation.name ? userInformation.name : 'N/A'},
      {label: 'Username:', value: userInformation.username},
      {label: 'Email:', value: userInformation.email},
      {label: 'OAuth Provider:', value: userInformation.oauthProvider ? userInformation.oauthProvider : 'N/A'},
      {label: 'Role:', value: userInformation.role},
      {label: 'Active:', value: userInformation.active ? 'Yes' : 'No'},
      {label: 'Frozen:', value: userInformation.frozen ? 'Yes' : 'No'},
      {label: 'Users Invited:', value: userInformation.usersInvited},
      {label: 'Invited By:', value: userInformation.invitedBy ?? 'N/A', clickable: userInformation.invitedBy !== null},
      {label: 'Register Date:', value: formattedDate}
    ];
  }

  handleAdminRegistration(username: string) {
    this.showRegistrationForm = false;
    this.findUserByUsername(username);
  }

  clearError() {
    this.errorMessage = '';
  }
}
