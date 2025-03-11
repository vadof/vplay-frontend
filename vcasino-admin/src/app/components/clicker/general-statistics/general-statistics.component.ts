import {Component, OnInit} from '@angular/core';
import {IGeneralStatistics} from "../../../models/clicker/IGeneralStatistics";
import {IChartData} from "../../../models/clicker/IChartData";
import {numberFormatter} from "../../../utils/global-utils";
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {ChartComponent} from "../../chart/chart.component";
import {MainStatisticsComponent} from "../../main-statistics/main-statistics.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-general-statistics',
  standalone: true,
  imports: [
    ChartComponent,
    MainStatisticsComponent,
    NgIf
  ],
  templateUrl: './general-statistics.component.html',
  styleUrl: './general-statistics.component.scss'
})
export class GeneralStatisticsComponent implements OnInit {
  mainStatistics: { label: string, value: number }[] = [];

  generalStatistics: IGeneralStatistics | undefined;
  show: boolean = false;

  levelYTicksCallback = (value: number) => value.toFixed(1) + '%';
  numberFormatYTicksCallback = (value: number) => numberFormatter.format(value);

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  ngOnInit() {
    this.http.get('/v1/clicker-data/admin/statistics/general').then(
      res => {
        this.generalStatistics = res as IGeneralStatistics;
        this.mainStatistics = [
          {label: 'Active Users Today', value: this.generalStatistics.activeUsersToday},
          {label: 'Clicks Today', value: this.generalStatistics.clicksToday},
          {label: 'Clicks Per User', value: this.generalStatistics.clicksPerUser},
          {label: 'Suspicious Activity Count', value: this.generalStatistics.suspiciousActivityCount},
          {label: 'Frozen Accounts', value: this.generalStatistics.frozenAccounts},
          {label: 'Streaks Taken Today', value: this.generalStatistics.streaksTakenToday},
          {label: 'Total Net Worth', value: this.generalStatistics.totalNetWorth},
          {label: 'Total Upgrades Purchased', value: this.generalStatistics.totalUpgradesPurchased}
        ];

        this.formatLabels(this.generalStatistics.activeUsersChart);

        this.show = true;
      }, err => {
        this.errorService.handleError(err);
      }
    );
  }

  selectChartOption(chart: string, option: string) {
    this.http.get(`/v1/clicker-data/admin/statistics/general/charts/${chart}?chartOption=${encodeURI(option)}`).then(res => {
        if (chart === 'activeUsers') {
          this.generalStatistics!.activeUsersChart = res as IChartData<string, number>;
          this.formatLabels(this.generalStatistics!.activeUsersChart);
        } else if (chart === 'totalClicks') {
          this.generalStatistics!.totalClicksChart = res as IChartData<string, number>;
        }
      }
    );
  }

  private formatLabels(chartData: IChartData<string, number>): void {
    chartData.labels = chartData.labels.map(label => {
      const date = new Date(label);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');

      return `${day}/${month}`;
    });
  }

}
