import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {HttpService} from "../../../services/http.service";
import {IStreaksInfo} from "../../../models/clicker/tasks/IStreaksInfo";
import {IDailyReward} from "../../../models/clicker/tasks/IDailyReward";
import {IStreakState} from "../../../models/clicker/tasks/IStreakState";
import {ErrorService} from "../../../services/error.service";
import {IAccount} from "../../../models/clicker/IAccount";
import {ConfettiService} from "../../../services/confetti.service";
import {ITask} from "../../../models/clicker/tasks/ITask";
import {CookieStorage} from "../../../services/cookie-storage.service";
import {numberFormatter} from "../../../utils/clicker-utils";

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit, OnDestroy {
  @Input({required: true}) streaksInfo!: IStreaksInfo;
  @Input({required: true}) tasks: ITask[] = [];
  @Output() accountUpdate: EventEmitter<IAccount> = new EventEmitter<IAccount>();

  dailyRewards: IDailyReward[] = [];
  streakState!: IStreakState;
  taskInProgress: TaskClick | undefined = undefined;
  completedTasks: TaskClick[] = [];

  timeoutId: any = undefined;

  constructor(
    private http: HttpService,
    private confettiService: ConfettiService,
    private errorService: ErrorService,
    private cookieStorage: CookieStorage
  ) {
  }

  ngOnInit(): void {
    this.streakState = this.streaksInfo.state;

    this.dailyRewards = this.streaksInfo.rewardsByDays;
    this.formatRewardValues();

    const taskProgress: TaskProgress | null = this.cookieStorage.getTaskProgress();
    if (taskProgress) {
      this.taskInProgress = taskProgress.taskInProgress;
      this.completedTasks = taskProgress.completedTasks ? taskProgress.completedTasks : [];
    }
    this.setCanClaim();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  claimDailyStreak(): void {
    if (this.streakState.available) {
      this.http.post('/v1/clicker/tasks/streaks', null).then(
        res => {
          this.confettiService.launchConfetti();
          this.streakState.available = false;

          this.accountUpdate.emit(res as IAccount);
        },
        err => this.errorService.handleError(err));
    }
  }

  startTask(task: ITask) {
    if (task.received) return;

    if (this.taskInProgress && this.timeoutId) {
      const taskInProgress = this.tasks.find(t => t.id === this.taskInProgress!.id);
      if (taskInProgress) {
        clearTimeout(this.timeoutId);
        taskInProgress.canClaimAt = undefined;
      }
    }

    this.setTaskProgress(task.id);
    const taskDuration: number = task.durationInSeconds ? task.durationInSeconds : 5;
    task.canClaimAt = this.getCurrentUTCSeconds() + taskDuration;
    this.setTimeoutBeforeCanClaim(task, taskDuration);

    window.open(task.link, '_blank', 'noopener,noreferrer');
  }

  claimTaskReward(task: ITask) {
    const clickDate: number = this.completedTasks.find(ct => ct.id === task.id)!.date;

    const clickTime: string = new Date(clickDate * 1000).toISOString().slice(0, 19);
    const body = {taskId: task.id, clickTime};
    this.http.post('/v1/clicker/tasks', body).then(
      res => {
        this.confettiService.launchConfetti();
        this.accountUpdate.emit(res as IAccount);

        task.received = true;
        task.canClaim = false;
        task.canClaimAt = undefined;

        this.completedTasks = this.completedTasks.filter(ct => ct.id !== task.id);
        this.cookieStorage.setTaskProgress({taskInProgress: this.taskInProgress, completedTasks: this.completedTasks})
      },
      err => this.errorService.handleError(err)
    );
  }

  private formatRewardValues(): void {
    if (this.dailyRewards.length > 0 && typeof this.dailyRewards[0].reward === 'number') {
      this.dailyRewards.forEach(dr => dr.reward = numberFormatter.format(+dr.reward))
    }

    if (this.tasks.length > 0 && typeof this.tasks[0].rewardCoins === 'number') {
      this.tasks.forEach(t => t.rewardCoins = numberFormatter.format(+t.rewardCoins));
    }
  }

  private setTimeoutBeforeCanClaim(task: ITask, seconds: number): void {
    this.timeoutId = setTimeout(() => {
      task.canClaim = true;
      task.canClaimAt = undefined;

      this.completedTasks.push(this.taskInProgress!);
      this.taskInProgress = undefined;
      this.cookieStorage.setTaskProgress({taskInProgress: undefined, completedTasks: this.completedTasks});
    }, seconds * 1000);
  }

  private setCanClaim(): void {
    const taskInProgress: TaskClick | undefined = this.taskInProgress;

    this.tasks.forEach(task => {
      if (task.received) {
        task.canClaim = false;
      } else if (this.completedTasks.find(ct => ct.id === task.id)) {
        task.canClaim = true;
      } else if (taskInProgress && taskInProgress.id === task.id) {
        const now: number = this.getCurrentUTCSeconds();
        task.canClaimAt = taskInProgress.date + (task.durationInSeconds ? task.durationInSeconds : 5);
        task.canClaim = task.canClaimAt <= now;

        if (!task.canClaim) {
          this.setTimeoutBeforeCanClaim(task, task.canClaimAt - now);
        }
      } else {
        task.canClaim = false;
      }
    })
  }

  private setTaskProgress(taskId: number): void {
    this.taskInProgress = {id: taskId, date: this.getCurrentUTCSeconds()}
    this.cookieStorage.setTaskProgress({taskInProgress: this.taskInProgress, completedTasks: this.completedTasks});
  }

  private getCurrentUTCSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

}

interface TaskClick {
  id: number;
  date: number;
}

export interface TaskProgress {
  taskInProgress: TaskClick | undefined;
  completedTasks: TaskClick[];
}
