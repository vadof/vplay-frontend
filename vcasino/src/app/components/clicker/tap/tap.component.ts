import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {IAccount} from "../../../models/clicker/IAccount";
import {HttpService} from "../../../services/http.service";
import {ITap} from "../../../models/clicker/ITap";
import {ErrorService} from "../../../services/error.service";

@Component({
  selector: 'app-tap',
  standalone: true,
  imports: [],
  templateUrl: './tap.component.html',
  styleUrl: './tap.component.scss'
})
export class TapComponent implements OnInit, OnDestroy {
  @Input({required: true}) account!: IAccount;
  @ViewChild('tapArea', {static: true, read: ElementRef}) tapArea!: ElementRef;
  @Output() balanceAdd: EventEmitter<number> = new EventEmitter<number>();
  @Output() accountUpdate: EventEmitter<IAccount> = new EventEmitter<IAccount>();

  lastTapIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private renderer: Renderer2,
    private http: HttpService,
    private errorService: ErrorService
  ) {
  }

  taps: number = 0;
  lastTap: number = 0;

  ngOnInit() {
    this.lastTapIntervalId = setInterval(() => {
      this.handleTapInterval();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.lastTapIntervalId) {
      if (this.taps) {
        this.sendTapRequest();
      }
      clearInterval(this.lastTapIntervalId);
    }
  }

  tap(event: MouseEvent) {
    if (this.account.availableTaps < this.account.earnPerTap) return;
    this.addElement(event);
    this.account.availableTaps -= this.account.earnPerTap;
    this.balanceAdd.emit(this.account.earnPerTap);
    this.lastTap = this.getUnixTime();
    this.taps++;
  }

  private handleTapInterval() {
    if ((this.taps && this.getUnixTime() - this.lastTap > 2) || this.taps >= 100) {
      this.sendTapRequest();
    }
  }

  private sendTapRequest() {
    const tapBody: ITap = {
      amount: this.taps,
      availableTaps: this.account.availableTaps,
      timestamp: this.getUnixTime()
    };

    this.taps = 0;

    this.http.post('/v1/clicker/tap', tapBody).then(
      res => this.accountUpdate.emit(res as IAccount),
      err => {
        this.errorService.handleError(err);
        this.account.availableTaps = Math.min(this.account.maxTaps, tapBody.amount * this.account.earnPerTap + this.account.availableTaps);
        this.balanceAdd.emit(tapBody.amount * -this.account.earnPerTap);
      });
  }

  private getUnixTime() {
    return Math.floor(Date.now() / 1000);
  }

  private addElement(event: MouseEvent): void {
    const rect: DOMRect = this.tapArea.nativeElement.getBoundingClientRect();

    const tap = this.renderer.createElement('div');
    const text = this.renderer.createText(`+${this.account.earnPerTap}`);

    this.renderer.addClass(tap, 'tap-animation');
    this.renderer.setStyle(tap, 'top', `${event.clientY - rect.top - 20}px`);
    this.renderer.setStyle(tap, 'left', `${event.clientX - rect.left}px`);

    this.renderer.appendChild(tap, text);
    this.renderer.appendChild(this.tapArea.nativeElement, tap);

    setTimeout(() => {
      this.renderer.removeChild(this.tapArea.nativeElement, tap);
    }, 1000)
  }
}
