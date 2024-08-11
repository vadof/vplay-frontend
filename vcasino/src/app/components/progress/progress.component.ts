import {Component, Input} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-progress',
  standalone: true,

  imports: [
    NgStyle
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent {
  @Input() value: number = 100;
  @Input() width: string = '2.5em';
  @Input() height: string = '0.1em';
}
