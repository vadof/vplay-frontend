import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ChartConfiguration, registerables} from "chart.js";
import {HttpService} from "../../services/http.service";
import Chart from "chart.js/auto";
import {BaseChartDirective} from "ng2-charts";
import {NgForOf, NgIf} from "@angular/common";
import {IChartData} from "../../models/clicker/IChartData";
import {numberFormatter} from "../../utils/global-utils";

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    BaseChartDirective,
    NgIf,
    NgForOf
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit, OnChanges {
  @Input({required: true}) label: string = '';
  @Input({required: true}) chartData!: IChartData<any, any>;
  @Input({required: true}) type: string = '';
  @Input({required: false}) yCallback: any = undefined;
  @Output() chooseOptionEvent: EventEmitter<string> = new EventEmitter<string>;

  show: boolean = false;
  lineConfig: any = undefined;
  barConfig: any = undefined;

  constructor(private http: HttpService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.initializeChart();
  }

  ngOnChanges() {
    this.initializeChart();
  }

  private initializeChart() {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'white',
            font: {
              weight: 700
            }
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
          },
        },
        y: {
          min: 0,
          ticks: {
            color: 'white',
            callback: this.yCallback,
          },
        },
      }
    };

    let chartLabel: string = this.label;
    if (this.chartData.selectedOption) {
      chartLabel += `- ${this.chartData.selectedOption}`;
    }

    let lineChartData: ChartConfiguration<'line'>['data'] = {
      labels: this.chartData.labels,
      datasets: [
        {
          label: chartLabel,
          data: this.chartData.data,
          borderColor: '#f3ba2f',
          backgroundColor: 'rgba(243,186,47,0.5)',
          fill: true,
        }
      ]
    };

    this.lineConfig = {
      data: lineChartData,
      options
    };

    let barChartData: ChartConfiguration<'bar'>['data'] = {
      labels: this.chartData.labels,
      datasets: [
        {
          label: chartLabel,
          data: this.chartData.data,
          backgroundColor: '#f3ba2f',
        }
      ]
    };

    this.barConfig = {
      data: barChartData,
      options
    };

    this.show = true;
  }

  changeOption(option: string) {
    this.chooseOptionEvent.emit(option);
  }
}
