import { Injectable } from '@angular/core';
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {Observable, Subject} from "rxjs";
import {environment} from "../../environments/environment";
import {IMarket} from "../models/esport/IMarket";
import {IMatchUpdate} from "../models/esport/IMatchUpdate";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private readonly wsUrl: string = 'ws:' + environment.API_URL.substring(environment.API_URL.indexOf('//')) + '/v1/bet/ws';

  private matchUpdateSubject: Subject<IMatchUpdate> = new Subject<IMatchUpdate>();
  matchUpdate$: Observable<IMatchUpdate> = this.matchUpdateSubject.asObservable();

  private matchMarketsSubject: Subject<IMarket[]> = new Subject<IMarket[]>();
  matchMarkets$: Observable<IMarket[]> = this.matchMarketsSubject.asObservable();

  private winnerMarketsSubscription: StompSubscription | null = null;
  private matchMarketsSubscription: StompSubscription | null = null;

  constructor() {}

  subscribeToMarketUpdates() {
    if (this.stompClient === null) {
      this.stompClient = new Client({
        brokerURL: this.wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      this.stompClient.onConnect = () => {
        this.subscribeToMatches();
      };

      this.stompClient.activate();
    }
  }

  private subscribeToMatches() {
    this.winnerMarketsSubscription = this.stompClient!.subscribe('/topic/matches', (message: IMessage) => {
      this.matchUpdateSubject.next(JSON.parse(message.body) as IMatchUpdate);
    });
  }

  subscribeToMatchMarkets(matchId: number) {
    this.matchMarketsSubscription = this.stompClient!.subscribe(`/topic/matches/${matchId}`, (message: IMessage) => {
      this.matchMarketsSubject.next(JSON.parse(message.body) as IMarket[]);
    });
  }

  unsubscribe() {
    if (this.winnerMarketsSubscription) {
      this.winnerMarketsSubscription.unsubscribe();
    }
    this.unsubscribeFromMatchMarkets();
  }

  unsubscribeFromMatchMarkets() {
    if (this.matchMarketsSubscription) {
      this.matchMarketsSubscription.unsubscribe();
    }
  }
}
