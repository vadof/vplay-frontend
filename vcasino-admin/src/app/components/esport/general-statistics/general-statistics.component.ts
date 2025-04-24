import {Component, OnInit} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {IBetStatistics} from "../../../models/esport/IBetStatistics";
import {ChartComponent} from "../../chart/chart.component";
import {MainStatisticsComponent} from "../../main-statistics/main-statistics.component";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-general-statistics',
  standalone: true,
  imports: [
    ChartComponent,
    MainStatisticsComponent,
    NgIf,
    FormsModule,
    NgForOf
  ],
  templateUrl: './general-statistics.component.html',
  styleUrl: './general-statistics.component.scss'
})
export class GeneralStatisticsComponent implements OnInit {

  show: boolean = false;
  statistics: { label: string, value: number }[] = [];
  selectedFiles: File[] = [];
  folderName: 'Tournaments' | 'Participants' = 'Tournaments';
  uploadedImages: string[] = [];

  constructor(private http: HttpService,
              private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.http.get('/v1/bet/admin/statistics').then(
      res => {
        const stats: IBetStatistics = res as IBetStatistics;
        this.statistics = [
          {label: 'Total Bets', value: stats.totalBets ? stats.totalBets : 0},
          {label: 'Bets Today', value: stats.betsToday ? stats.betsToday : 0},
          {label: 'Bets Last Week', value: stats.betsLastWeek ? stats.betsLastWeek : 0},
          {label: 'Bets Last Month', value: stats.betsLastMonth ? stats.betsLastMonth : 0},
          {label: 'Total Amount Wagered', value: stats.totalAmountWagered ? stats.totalAmountWagered : 0},
          {label: 'WIN amount', value: stats.totalAmountWin ? stats.totalAmountWin : 0},
          {label: 'LOSS amount', value: stats.totalAmountLoss ? stats.totalAmountLoss : 0},
          {label: 'Service Profit', value: stats.totalServiceProfit ? stats.totalServiceProfit : 0},
        ];

        this.show = true;
      },
      err => this.errorService.handleError(err)
    );
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onUpload(): void {
    if (this.selectedFiles.length === 0 || !this.folderName) {
      return;
    }

    const formData: FormData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    this.http.post(`/v1/bet/admin/images/upload/${this.folderName.toLowerCase()}`, formData, null).then(
      res => {
        (res as string[]).forEach(i => this.uploadedImages.push(i));
        this.removeFiles();
      },
      err => this.errorService.handleError(err));
  }

  removeFiles(): void {
    this.selectedFiles = [];
  }
}
