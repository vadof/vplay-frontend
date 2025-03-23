import {Component, Input, OnInit} from '@angular/core';
import {ILevel} from "../../../models/clicker/ILevel";
import {ProgressComponent} from "../../progress/progress.component";
import {calculateLevelProgress, getLevelColor, numberFormatter} from "../../../utils/clicker-utils";
import {NgClass, NgIf, NgStyle} from "@angular/common";

@Component({
  selector: 'app-level-overview',
  standalone: true,
  imports: [
    ProgressComponent,
    NgClass,
    NgIf,
    NgStyle
  ],
  templateUrl: './level-overview.component.html',
  styleUrl: './level-overview.component.scss'
})
export class LevelOverviewComponent implements OnInit {
  @Input({required: true}) levels: ILevel[] = [];
  @Input({required: true}) currentLevel: number = 1;
  @Input({required: true}) netWorth: number = 1;
  displayLevel: number = 1;
  levelColor: string = '';

  progress: number = 0;
  levelInfo: string = '';
  levelName: string = '';

  ngOnInit() {
    this.displayLevel = this.currentLevel;
    this.changeLevel(this.currentLevel);
  }

  changeLevel(value: number) {
    const level: ILevel = this.levels[value - 1];
    this.displayLevel = value;
    this.levelName = level.name;

    if (value === this.currentLevel) {
      this.progress = calculateLevelProgress(this.currentLevel, this.netWorth, this.levels);
      if (level.value < 10) {
        this.levelInfo = `${numberFormatter.format(this.netWorth)}/${numberFormatter.format(this.levels[value].netWorth)}`
      } else {
        this.levelInfo = `${level.netWorth}/${level.netWorth}`;
      }
    } else {
      this.progress = 0;
      this.levelInfo = this.getLevelInfo(level);
    }
    this.levelColor = getLevelColor(value);
  }

  private getLevelInfo(level: ILevel): string {
    if (level.value === 1) {
      return 'From 0';
    } else if (level.netWorth >= 1_000_000_000) {
      return `From ${level.netWorth / 1_000_000_000}B`
    } else if (level.netWorth >= 1_000_000) {
      return `From ${level.netWorth / 1_000_000}M`
    } else {
      return `From ${level.netWorth / 1000}K`
    }
  }
}
