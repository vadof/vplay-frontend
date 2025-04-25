import {Component, OnInit} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {ITopPlayer} from "../../../models/esport/ITopPlayer";
import {IUserInformation} from "../../../models/esport/IUserInformation";
import {convertUTCToLocal} from "../../../utils/global-utils";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {SearchComponent} from "../../search/search.component";

@Component({
  selector: 'app-user-statistics',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SearchComponent,
    NgClass
  ],
  templateUrl: './user-statistics.component.html',
  styleUrl: './user-statistics.component.scss'
})
export class UserStatisticsComponent implements OnInit {
  show: boolean = false;

  topPlayers: ITopPlayer[] = [];

  currentUserInformation: IUserInformation | undefined;

  searchHistory: IUserInformation[] = [];
  searchOptions: { label: string, type: 'string' | 'number' }[] = [
    {label: 'ID', type: 'number'}
  ];

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.http.get('/v1/bet/admin/statistics/users/top').then(
      res => this.topPlayers = res as ITopPlayer[],
      err => this.errorService.handleError(err)
    );
  }

  searchUser(searchOutput: { option: string, value: string }): void {
    const id: number = +searchOutput.value;
    this.fetchUserStatistics(id);
  }

  fetchUserStatistics(id: number): void {
    if (this.currentUserInformation === undefined || this.currentUserInformation.userId !== id) {

      const existingInformation = this.searchHistory.find(ui => ui.userId === id);
      if (existingInformation) {
        this.displayUserInformation(existingInformation);
      } else {
        this.http.get(`/v1/bet/admin/statistics/users?userId=${id}`).then(
          res => this.displayUserInformation(res as IUserInformation),
          err => this.errorService.handleError(err)
        );
      }
    }
  }

  switchUserInformationItem(userInformation: IUserInformation): void {
    const existing = this.searchHistory.find(ai => ai.userId === userInformation.userId);
    this.displayUserInformation(existing!);
  }

  private displayUserInformation(userInformation: IUserInformation): void {
    if (this.currentUserInformation === undefined
      || !this.searchHistory.some(u => u.userId === userInformation.userId)) {
      this.searchHistory.unshift(userInformation);
    }

    this.currentUserInformation = userInformation;

    this.currentUserInformation.latestBets.forEach(b => {
      b.createdAt = convertUTCToLocal(b.createdAt.split('.')[0]);
    });
  }
}
