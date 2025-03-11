import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {numberFormatter} from "../../utils/global-utils";

@Component({
  selector: 'app-main-statistics',
  standalone: true,
    imports: [
        NgForOf,
        NgIf
    ],
  templateUrl: './main-statistics.component.html',
  styleUrl: './main-statistics.component.scss'
})
export class MainStatisticsComponent implements OnInit {
  @Input({required: true}) statistics: { label: string, value: number | string }[] = [];
  @Input() formatValues: boolean = false;

  ngOnInit() {
    if (this.formatValues) {
      this.statistics = this.statistics.map(stat => ({
        ...stat,
        value: typeof stat.value === 'number' ? numberFormatter.format(stat.value) : stat.value
      }));
    }
  }
}
