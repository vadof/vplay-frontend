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
  private readonly wsUrl: string = environment.BET_WEBSOCKET_URL;

  private matchUpdateSubject: Subject<IMatchUpdate> = new Subject<IMatchUpdate>();
  matchUpdate$: Observable<IMatchUpdate> = this.matchUpdateSubject.asObservable();

  private matchMarketsSubject: Subject<IMarket[]> = new Subject<IMarket[]>();
  matchMarkets$: Observable<IMarket[]> = this.matchMarketsSubject.asObservable();

  private winnerMarketsSubscription: StompSubscription | null = null;
  private matchMarketsSubscription: {subscription: StompSubscription | null; matchId: number | null} = {
    subscription: null, matchId: null
  };

  private pingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {}

  subscribeToMarketUpdates(): void {
    if (this.stompClient === null) {
      this.stompClient = new Client({
        brokerURL: this.wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0
      });

      this.stompClient.onConnect = () => {
        this.subscribeToMatches();
        if (this.matchMarketsSubscription.matchId !== null) {
          this.subscribeToMatchMarkets(this.matchMarketsSubscription.matchId);
        }

        if (this.pingIntervalId !== null) {
          clearInterval(this.pingIntervalId);
        }

        this.pingIntervalId = setInterval(() => {
          if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
              destination: '/app/ping',
              body: JSON.stringify({ timestamp: Date.now() })
            });
          }
        }, 30000);
      };

      this.stompClient.onDisconnect = () => {
        if (this.pingIntervalId !== null) {
          clearInterval(this.pingIntervalId);
          this.pingIntervalId = null;
        }
      };

      this.stompClient.activate();
    }
  }

  private subscribeToMatches(): void {
    if (this.stompClient) {
      this.winnerMarketsSubscription = this.stompClient.subscribe('/topic/matches', (message: IMessage) => {
        this.matchUpdateSubject.next(JSON.parse(message.body) as IMatchUpdate);
      });
    }
  }

  subscribeToMatchMarkets(matchId: number): void {
    if (this.stompClient) {
      this.matchMarketsSubscription.matchId = matchId;
      this.matchMarketsSubscription.subscription = this.stompClient.subscribe(`/topic/matches/${matchId}`, (message: IMessage) => {
        this.matchMarketsSubject.next(JSON.parse(message.body) as IMarket[]);
      });
    }
  }

  unsubscribe(): void {
    if (this.winnerMarketsSubscription) {
      this.winnerMarketsSubscription.unsubscribe();
    }
    this.unsubscribeFromMatchMarkets();
    if (this.stompClient) {
      this.stompClient.forceDisconnect();
      this.stompClient = null;
    }
  }

  unsubscribeFromMatchMarkets(): void {
    if (this.matchMarketsSubscription.subscription) {
      this.matchMarketsSubscription.subscription.unsubscribe();
      this.matchMarketsSubscription.matchId = null;
    }
  }
}
