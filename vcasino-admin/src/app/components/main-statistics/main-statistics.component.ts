import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";

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
export class MainStatisticsComponent {
  @Input({required: true}) statistics: { label: string, value: number }[] = [];
}
