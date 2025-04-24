import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {IMatchStatistics} from "../../../models/esport/IMatchStatistics";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpService} from "../../../services/http.service";
import {ErrorService} from "../../../services/error.service";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {IMarketStatisticsByCategory} from "../../../models/esport/IMarketStatisticsByCategory";
import {IMarketStatistics} from "../../../models/esport/IMarketStatistics";
import {convertLocalToUTC, convertUTCToLocal} from "../../../utils/global-utils";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-match-statistics',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    NgOptimizedImage,
    NgClass,
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './match-statistics.component.html',
  styleUrl: './match-statistics.component.scss'
})
export class MatchStatisticsComponent implements OnInit, OnChanges {
  @Input({required: false}) selectedTournamentId: number | null = null;
  show: boolean = false;

  private requestInProcess: boolean = false;
  matchStatistics: IMatchStatistics[] = [];
  private marketsById: Map<number, IMarketStatistics> = new Map();

  startDate: string = '';
  endDate: string = '';

  editMode: 'WIN' | 'CANCELLED' | 'LOSS' | undefined;
  marketWinIds: number[] = [];
  marketLossIds: number[] = [];
  marketCancelledIds: number[] = [];

  constructor(private http: HttpService, private errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.setInitialDates();
    this.getMatches(this.selectedTournamentId);
  }

  ngOnChanges(): void {
    this.setInitialDates();
    this.getMatches(this.selectedTournamentId);
  }

  private setInitialDates() {
    const date: Date = new Date();
    date.setUTCDate(date.getUTCDate());
    date.setUTCHours(0, 0, 0, 0);
    this.startDate = date.toISOString().split('.')[0].replace('T', ' ');
  }

  public getMatches(tournamentId: number | null): void {
    if (this.requestInProcess) return;
    this.requestInProcess = true;

    let url: string = '/v1/bet/admin/statistics/matches?';
    if (tournamentId === null) {
      url += `startDate=${this.getValidatedDate(this.startDate)}`;
      if (this.endDate) {
        url += `&endDate=${this.getValidatedDate(this.endDate)}`;
      }
    } else {
      url += `tournamentId=${tournamentId}`
    }

    this.http.get(url).then(
      res => {
        this.handleMatchResponse(res as IMatchStatistics[]);
        this.show = true;
        this.requestInProcess = false;
      }, err => {
        this.errorService.handleError(err);
        this.requestInProcess = false;
      }
    )
  }

  private handleMatchResponse(res: IMatchStatistics[]): void {
    res.forEach(i => {
      i.showStatistics = false;
      i.showMarkets = false;
      i.winProbability1 = Math.round(i.winProbability1 * 100);
      i.winProbability2 = Math.round(i.winProbability2 * 100);
      i.discipline = i.discipline.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
      i.status = i.status.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      i.startDate = convertUTCToLocal(i.startDate);
    });
    this.matchStatistics = res;
  }

  private getValidatedDate(startDate: string): string {
    const dateRegex: RegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (!dateRegex.test(startDate)) {
      this.errorService.showError('Invalid date format. Expected format: yyyy-MM-dd HH:mm:ss');
      return '';
    }

    return convertLocalToUTC(startDate).replace(' ', 'T');
  }

  showMarkets(matchStatistics: IMatchStatistics): void {
    if (!matchStatistics.marketsByCategory) {
      this.reloadMarkets(matchStatistics);
    }
    matchStatistics.showMarkets = true;
  }

  reloadMarkets(matchStatistics: IMatchStatistics): void {
    this.http.get(`/v1/bet/admin/statistics/markets/${matchStatistics.matchId}`).then(
      res => {
        this.marketsById.clear();
        matchStatistics.marketsByCategory = res as IMarketStatisticsByCategory[];

        matchStatistics.marketsByCategory.forEach(i => {
          i.marketPairs.forEach(p => {
            p.forEach(
              market => this.marketsById.set(market.marketId, market));
          });
        });
      }
    )
  }

  goToEditMode(editMode: 'WIN' | 'CANCELLED' | 'LOSS' | undefined): void {
    if (this.editMode === editMode) {
      this.editMode = undefined;
    } else {
      this.editMode = editMode;
    }
  }

  setMarketResult(pair: IMarketStatistics[], market: IMarketStatistics): void {
    if (this.editMode === undefined) return;

    const otherMarket: IMarketStatistics = pair.find(m => m.marketId !== market.marketId)!;
    if (market.result !== null) {
      if (market.result === 'WIN' && this.marketWinIds.find(id => id === market.marketId) !== undefined) {
        market.result = null;
        otherMarket.result = null;
        this.marketWinIds = this.marketWinIds.filter(id => id !== market.marketId);
        this.marketLossIds = this.marketLossIds.filter(id => id !== otherMarket.marketId);
      } else if (market.result === 'LOSS' && this.marketLossIds.find(id => id === market.marketId) !== undefined) {
        market.result = null;
        otherMarket.result = null;
        this.marketLossIds = this.marketLossIds.filter(id => id !== market.marketId);
        this.marketWinIds = this.marketWinIds.filter(id => id !== otherMarket.marketId);
      } else if (this.marketCancelledIds.find(id => id === market.marketId) !== undefined) {
        market.result = null;
        otherMarket.result = null;
        this.marketCancelledIds = this.marketCancelledIds.filter(id => id !== market.marketId && id !== otherMarket.marketId);
      }

      return;
    }

    if (this.editMode === 'WIN') {
      market.result = 'WIN';
      otherMarket.result = 'LOSS';
      this.marketWinIds.push(market.marketId);
      this.marketLossIds.push(otherMarket.marketId)
    } else if (this.editMode === 'LOSS') {
      market.result = 'LOSS';
      otherMarket.result = 'WIN';
      this.marketLossIds.push(market.marketId);
      this.marketWinIds.push(otherMarket.marketId)
    } else {
      market.result = 'CANCELLED';
      otherMarket.result = 'CANCELLED';
      this.marketCancelledIds.push(market.marketId);
      this.marketCancelledIds.push(otherMarket.marketId)
    }
  }

  resetMarketChanges(): void {
    this.editMode = undefined;
    this.resetResults(this.marketWinIds);
    this.resetResults(this.marketLossIds);
    this.resetResults(this.marketCancelledIds);
    this.marketWinIds = [];
    this.marketLossIds = [];
    this.marketCancelledIds = [];
  }

  private resetResults(ids: number[]): void {
    ids.forEach(id => {
      const market: IMarketStatistics | undefined = this.marketsById.get(id);
      if (market) {
        market.result = null;
      }
    });
  }

  saveMarketChanges(): void {
    if (this.marketWinIds.length > 0) {
      this.http.post('/v1/bet/admin/markets/result', {marketIds: this.marketWinIds, marketResult: 'WIN'}).then(
        () => {
          this.marketWinIds = [];
        }, err => this.errorService.handleError(err)
      );
    }

    if (this.marketLossIds.length > 0) {
      this.http.post('/v1/bet/admin/markets/result', {marketIds: this.marketLossIds, marketResult: 'LOSS'}).then(
        () => {
          this.marketLossIds = [];
        }, err => this.errorService.handleError(err)
      );
    }

    if (this.marketCancelledIds.length > 0) {
      this.http.post('/v1/bet/admin/markets/result', {
        marketIds: this.marketCancelledIds,
        marketResult: 'CANCELLED'
      }).then(
        () => {
          this.marketCancelledIds = [];
        }, err => this.errorService.handleError(err)
      );
    }
  }
}
