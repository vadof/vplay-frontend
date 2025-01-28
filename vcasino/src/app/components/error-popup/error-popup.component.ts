import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-error-popup',
  standalone: true,
  imports: [],
  templateUrl: './error-popup.component.html',
  styleUrl: './error-popup.component.scss'
})
export class ErrorPopupComponent implements OnInit {
  @Input({required: false}) errorMessage: string = 'Oops, something went wrong.';
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => this.closePopup(false), 5000);
  }

  closePopup(force: boolean = true) {
    if (force && this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.closeEvent.emit();
  }

}
