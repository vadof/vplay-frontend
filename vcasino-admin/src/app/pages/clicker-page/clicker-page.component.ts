import {Component} from '@angular/core';
import {ErrorPopupComponent} from "../../components/error-popup/error-popup.component";
import {HeaderComponent} from "../../components/header/header.component";
import {NgIf} from "@angular/common";
import {MainStatisticsComponent} from "../../components/main-statistics/main-statistics.component";
import {ChartComponent} from "../../components/chart/chart.component";
import {ErrorService} from "../../services/error.service";
import {GeneralStatisticsComponent} from "../../components/clicker/general-statistics/general-statistics.component";
import {AccountInformationComponent} from "../../components/clicker/account-information/account-information.component";
import {TaskStatisticsComponent} from "../../components/clicker/tasks/task-statistics.component";

@Component({
  selector: 'app-clicker-page',
  standalone: true,
  imports: [
    ErrorPopupComponent,
    HeaderComponent,
    NgIf,
    MainStatisticsComponent,
    ChartComponent,
    GeneralStatisticsComponent,
    AccountInformationComponent,
    TaskStatisticsComponent,
  ],
  templateUrl: './clicker-page.component.html',
  styleUrl: './clicker-page.component.scss'
})
export class ClickerPageComponent {
  errorMessage: string = '';
  section: 'general' | 'account' | 'tasks' = 'general';

  constructor(private errorService: ErrorService) {
    this.errorService.error$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  switchSection(section: 'general' | 'account' | 'tasks') {
    this.section = section;
  }

  clearError() {
    this.errorMessage = '';
  }
}
