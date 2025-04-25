import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpService} from "../../../services/http.service";
import {IBet} from "../../../models/esport/IBet";
import {IPaginatedResponse} from "../../../models/IPaginatedResponse";
import {ErrorService} from "../../../services/error.service";
import {formatDate, NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-bet-history',
  standalone: true,
  imports: [
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './bet-history.component.html',
  styleUrl: './bet-history.component.scss'
})
export class BetHistoryComponent implements OnInit {
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(private http: HttpService,
              private errorService: ErrorService) {
  }

  currentPage: number = 0;
  totalPages: number = 0;
  bets: { visibleItems: BetItem[], hiddenItems: BetItem[], show: boolean }[] = [];

  ngOnInit(): void {
    this.getBetsPage(0);
  }

  getBetsPage(page: number): void {
    if (page >= 0 && page <= this.totalPages) {
      this.http.get(`/v1/bet/history?page=${page}`).then(
        res => {
          const response: IPaginatedResponse<IBet> = res as IPaginatedResponse<IBet>;
          this.currentPage = response.page;
          this.totalPages = response.totalPages - 1;
          this.initBets(response.data);
        }, err => {
          this.errorService.handleError(err);
        })
    }
  }

  private initBets(bets: IBet[]) {
    this.bets = [];

    bets.forEach(b => {
      let color: string | undefined = undefined;
      if (b.result === 'WIN') {
        color = 'text-success'
      } else if (b.result === 'LOSS') {
        color = 'text-danger'
      }

      this.bets.push(
        {
          visibleItems: [
            {label: 'Outcome', value: b.outcome, fontColorClass: undefined},
            {label: 'Bet', value: b.amount.toFixed(2), fontColorClass: undefined},
            {label: 'Odds', value: b.odds.toFixed(2), fontColorClass: undefined},
            {label: 'Win', value: b.win !== null ? b.win.toFixed(2) : '0.00', fontColorClass: color},
            {label: 'Result', value: b.result ? b.result : 'PENDING', fontColorClass: color}
          ],
          hiddenItems: [
            {label: 'Event', value: b.event, fontColorClass: undefined},
            {label: 'Date', value: formatDate(b.date, 'yyyy-MM-dd HH:mm:ss', 'en-US'), fontColorClass: undefined}
          ],
          show: false
        }
      );
    });

  }

  close(): void {
    this.closeEvent.emit();
  }
}

interface BetItem {
  label: string;
  value: any;
  fontColorClass: string | undefined
}

