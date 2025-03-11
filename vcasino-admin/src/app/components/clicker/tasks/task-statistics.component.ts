import {Component, OnInit} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {ISupportedTaskServices} from "../../../models/clicker/ISupportedTaskServices";
import {ITask} from "../../../models/clicker/ITask";
import {NgForOf, NgIf} from "@angular/common";
import {TaskItemComponent} from "./task-item/task-item.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ErrorResponse} from "../../../models/auth/ErrorResponse";
import {ITaskUpdate} from "../../../models/clicker/ITaskUpdate";
import {SearchComponent} from "../../search/search.component";
import {IAccountInformation} from "../../../models/clicker/IAccountInformation";

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TaskItemComponent,
    NgIf,
    ReactiveFormsModule,
    NgIf,
    ReactiveFormsModule,
    NgIf,
    SearchComponent
  ],
  templateUrl: './task-statistics.component.html',
  styleUrl: './task-statistics.component.scss'
})
export class TaskStatisticsComponent implements OnInit {

  supportedTaskServices: ISupportedTaskServices[] = [];
  activeTasks: ITask[] = [];
  recentlyCreatedTasks: ITask[] = [];

  showTaskForm: boolean = false;
  selectedTaskType: string = '';
  selectedTaskService: string = '';
  taskServices: string[] = [];

  errorMessage = '';
  taskForm: FormGroup = new FormGroup({
    id: new FormControl<string>('', Validators.required),
    taskName: new FormControl<string>('', Validators.required),
    rewardCoins: new FormControl<number>(0, Validators.required),
    validFrom: new FormControl<string>('', Validators.required),
    endsIn: new FormControl<string>(''),
  });

  searchOptions: {label: string, type: 'string' | 'number'}[] =  [
    {label: 'ID', type: 'number'},
    {label: 'Name', type: 'string'},
    {label: 'Link ID', type: 'string'},
  ];

  foundTasks: ITask[] = [];

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.http.get('/v1/clicker/admin/tasks/properties').then(
      res => this.supportedTaskServices = res as ISupportedTaskServices[],
      err => this.errorService.handleError(err)
    );

    this.getStatistics();
  }

  private getStatistics() {
    this.http.get('/v1/clicker-data/admin/statistics/tasks/active').then(
      res => this.activeTasks = res as ITask[],
      err => this.errorService.handleError(err)
    );

    this.http.get('/v1/clicker-data/admin/statistics/tasks/recent').then(
      res => this.recentlyCreatedTasks = res as ITask[],
      err => this.errorService.handleError(err)
    );
  }

  selectTaskType(taskType: string) {
    this.selectedTaskType = taskType;
    this.taskServices = this.supportedTaskServices.find(t => t.taskType === taskType)!.services;
    this.selectedTaskService = this.taskServices[0];
  }

  addTask() {
    if (this.taskForm.valid) {
      const body = {
        id: this.taskForm.value.id as string,
        taskType: this.selectedTaskType,
        service: this.selectedTaskService,
        taskName: this.taskForm.value.taskName as string,
        rewardCoins: this.taskForm.value.rewardCoins as number,
        dateRange: {
          start: this.formatFormDate(this.taskForm.value.validFrom as string),
          end: this.formatFormDate(this.taskForm.value.endsIn as string)
        }
      }

      this.http.post('/v1/clicker/admin/tasks', body).then(
        () => {
          this.getStatistics();
          this.showTaskForm = false;
          this.taskForm.reset();
        },
        err => this.errorMessage = (err.error as ErrorResponse).message
      );
    } else {
      this.errorMessage = 'Fill in the empty fields!';
    }
  }

  updateTask(taskUpdate: ITaskUpdate) {
    const task: ITask = taskUpdate.task;

    const body = {
      name: taskUpdate.name ? taskUpdate.name : task.name,
      rewardCoins: taskUpdate.rewardCoins ? taskUpdate.rewardCoins : task.rewardCoins,
      dateRange: {
        start: taskUpdate.validFrom ? taskUpdate.validFrom : task.validFrom,
        end: taskUpdate.endsIn
      }
    }

    this.http.put(`/v1/clicker/admin/tasks/${taskUpdate.task.id}`, body).then(
      () => this.getStatistics(),
      err => this.errorService.handleError(err)
    );
  }

  searchTasks(searchOutput: {option: string, value: string}) {
    let url: string = '/v1/clicker-data/admin/statistics/tasks?';
    if (searchOutput.option === 'ID') {
      url += `taskId=${searchOutput.value}`
    } else if (searchOutput.option === 'Name') {
      url += `taskName=${searchOutput.value}`
    } else {
      url += `linkId=${searchOutput.value}`
    }

    this.http.get(url).then(
      res => this.foundTasks = res as ITask[],
      err => this.errorService.handleError(err)
    );
  }

  private formatFormDate(dateString: string) {
    if (dateString) {
      const date: Date = new Date(dateString);
      return date.toISOString().split("T")[0] + "T00:00:00";
    }
    return null;
  }
}
