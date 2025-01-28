import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProgressComponent} from "../../progress/progress.component";
import {ILevel} from "../../../models/clicker/ILevel";
import {NgIf} from "@angular/common";
import {calculateLevelProgress} from "../../../utils/clicker-utils";

@Component({
  selector: 'app-level-info',
  standalone: true,
  imports: [
    ProgressComponent,
    NgIf
  ],
  templateUrl: './level-info.component.html',
  styleUrl: './level-info.component.scss'
})
export class LevelInfoComponent implements OnInit {
  @Input({required: true}) levels: ILevel[] = [];
  @Input({required: true}) currentLevel: number = 0;
  @Input({required: true}) netWorth: number = 0;
  @Output() panelChange: EventEmitter<string> = new EventEmitter<string>();
  name: string = '';

  ngOnInit(): void {
    this.name = this.levels[this.currentLevel - 1].name;
  }

  getNetWorth(): number {
    return calculateLevelProgress(this.currentLevel, this.netWorth, this.levels);
  }

  openLevelOverviewPanel() {
    this.panelChange.emit('level');
  }

}
