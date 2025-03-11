import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ITask} from "../../../../models/clicker/ITask";
import {FormsModule} from "@angular/forms";
import {ITaskUpdate} from "../../../../models/clicker/ITaskUpdate";
import {ErrorService} from "../../../../services/error.service";

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss'
})
export class TaskItemComponent implements OnInit, OnChanges {
  @Input() tasks: ITask[] = [];
  @Output() taskUpdate: EventEmitter<ITaskUpdate> = new EventEmitter<ITaskUpdate>();

  constructor(private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.prepareTasks(this.tasks);
  }

  ngOnChanges(): void {
    this.prepareTasks(this.tasks);
  }

  prepareTasks(tasks: ITask[]) {
    tasks.forEach(task => {
      task.item = [
        {label: 'Name', value: task.name, link: false, editable: true, inputType: 'text', inputValue: task.name},
        {label: 'Type', value: task.type, link: false, editable: false, inputType: null, inputValue: undefined},
        {label: 'Link', value: task.link, link: true, editable: false, inputType: null, inputValue: undefined},
        {label: 'Duration', value: task.durationInSeconds ? task.durationInSeconds : 'N/A', link: false, editable: false, inputType: null, inputValue: undefined},
        {label: 'Service', value: task.serviceName, link: false, editable: false, inputType: null, inputValue: undefined},
        {label: 'Reward coins', value: task.rewardCoins, link: false, editable: true, inputType: 'number', inputValue: task.rewardCoins},
        {label: 'Validity period', value: this.formatDate(task.validFrom) + ' - ' + (task.endsIn ? this.formatDate(task.endsIn) : 'inf'),
          link: false, editable: true, inputType: 'date', inputValue: [this.formatDate(task.validFrom), this.formatDate(task.endsIn)]},
        {label: 'Created at', value: this.formatDate(task.createdAt), link: false, editable: false, inputType: null, inputValue: undefined},
        {label: 'Completed times', value: task.completedTimes, link: false, editable: false, inputType: null, inputValue: undefined}
      ];
      task.show = false;
      task.edit = false;
    })
  }

  private formatDate(date: string) {
    if (date) {
      return date.replace('T', ' ');
    }
    return date;
  }

  saveChanges(task: ITask) {
    const update: ITaskUpdate = {
      task,
      name: null,
      rewardCoins: null,
      validFrom: null,
      endsIn: null,
    }

    const nameUpdated: boolean = this.updateName(task, update);
    const coinsUpdated: boolean = this.updateRewardCoins(task, update);
    const dateUpdated: boolean = this.updateDate(task, update);

    if (nameUpdated || coinsUpdated || dateUpdated) {
      this.taskUpdate.emit(update);
    }
  }

  private updateDate(task: ITask, update: ITaskUpdate): boolean {
    let changed = false;
    const property = task.item.find(i => i.label === 'Validity period');
    if (property) {
      const deleteEnd: boolean = property.inputValue[1] === 'DEL';
      if (deleteEnd) {
        property.inputValue[1] = null;
      }

      if (!this.validDates(property.inputValue[0], property.inputValue[1])) {
        return false;
      }

      const newStart = property.inputValue[0].replace(' ', 'T');
      const newEnd = property.inputValue[1] ? property.inputValue[1].replace(' ', 'T') : property.inputValue[1];

      if (task.validFrom !== newStart) {
        update.validFrom = newStart;
        changed = true;
      }
      if (task.endsIn !== newEnd) {
        update.endsIn = newEnd;
        changed = true;
      }
    }

    return changed;
  }

  private updateName(task: ITask, update: ITaskUpdate): boolean {
    const property = task.item.find(i => i.label === 'Name');
    if (property !== undefined && property.inputValue !== task.name) {
      update.name = property.inputValue;
      return true;
    }
    return false;
  }

  private updateRewardCoins(task: ITask, update: ITaskUpdate): boolean {
    const property = task.item.find(i => i.label === 'Reward coins');
    if (property !== undefined && property.inputValue !== task.rewardCoins) {
      update.rewardCoins = property.inputValue;
      return  true;
    }
    return false;
  }

  endTask(task: ITask) {
    const update: ITaskUpdate = {
      task,
      name: null,
      rewardCoins: null,
      validFrom: null,
      endsIn: task.validFrom,
    }

    this.taskUpdate.emit(update);
  }

  private validDates(start: string, end: string | null): boolean {
    const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!pattern.test(start)) {
      this.errorService.handleErrorMessage(`Invalid start date: ${start}, must match YYYY-MM-DD HH:MM:SS`);
      return false;
    } else if (end && !pattern.test(end)) {
      this.errorService.handleErrorMessage(`Invalid end date: ${end}, must match YYYY-MM-DD HH:MM:SS`);
      return false;
    }
    return true;
  }
}
