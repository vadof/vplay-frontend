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
import {getMessageFromError} from "../../../utils/global-utils";
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
  energyIntervalId: ReturnType<typeof setInterval> | null = null;
  lastTapIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private renderer: Renderer2,
    private http: HttpService,
    private errorService: ErrorService
  ) {
  }

  availableEnergy: number = 0;
  maxEnergy = 0;
  tapsRecoverPerSec = 0;
  earnPerTap = 0;
  taps: number = 0;
  lastTap: number = 0;

  ngOnInit() {
    this.availableEnergy = this.account.availableTaps;
    this.maxEnergy = this.account.maxTaps;
    this.tapsRecoverPerSec = this.account.tapsRecoverPerSec;
    this.earnPerTap = this.account.earnPerTap;

    this.energyIntervalId = setInterval(() => {
      this.availableEnergy = Math.min(this.availableEnergy + this.tapsRecoverPerSec, this.maxEnergy);
    }, 1000);

    this.lastTapIntervalId = setInterval(() => {
      this.handleTapInterval();
    }, 1000);
  }

  // TODO if value is 500 and fast switch between sections value again 1000
  ngOnDestroy() {
    if (this.energyIntervalId) {
      clearInterval(this.energyIntervalId);
    }
  }

  handleTap(event: MouseEvent) {
    if (this.availableEnergy < this.earnPerTap) return;
    this.addElement(event);
    this.availableEnergy -= this.earnPerTap;
    this.updateBalance();
    this.lastTap = this.getUnixTime();
    this.taps++;
  }

  private addElement(event: MouseEvent): void {
    const rect: DOMRect = this.tapArea.nativeElement.getBoundingClientRect();

    const tap = this.renderer.createElement('div');
    const text = this.renderer.createText(`+${this.earnPerTap}`);

    this.renderer.addClass(tap, 'tap-animation');
    this.renderer.setStyle(tap, 'top', `${event.clientY - rect.top - 20}px`);
    this.renderer.setStyle(tap, 'left', `${event.clientX - rect.left}px`);

    this.renderer.appendChild(tap, text);
    this.renderer.appendChild(this.tapArea.nativeElement, tap);

    setTimeout(() => {
      this.renderer.removeChild(this.tapArea.nativeElement, tap);
    }, 1000)
  }

  private handleTapInterval() {
    if (this.taps && this.getUnixTime() - this.lastTap > 2) {
      const tapBody: ITap = {
        amount: this.taps,
        availableTaps: this.availableEnergy,
        timestamp: this.getUnixTime()
      };

      this.taps = 0;

      this.http.post('/v1/clicker/tap', tapBody)
        .then(res => {
          this.updateAccount(res as IAccount);
        }, err => this.errorService.showError(getMessageFromError(err)));
    }
  }

  private getUnixTime() {
    return Math.floor(Date.now() / 1000);
  }

  updateBalance() {
    this.balanceAdd.emit(this.earnPerTap);
  }

  updateAccount(account: IAccount) {
    this.accountUpdate.emit(account);
  }
}
