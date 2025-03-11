import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ErrorService} from "../../services/error.service";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  @Input({required: true}) options: {label: string, type: 'string' | 'number'}[] = [];
  @Output() searchEvent: EventEmitter<{option: string, value: string}> = new EventEmitter<{option: string, value: string}>();
  searchQuery: string= '';
  selectedOption: string = '';

  constructor(private errorService: ErrorService) {
  }

  ngOnInit(): void {
     this.selectedOption = this.options[0].label;
  }

  search() {
    const option = this.options.find(o => o.label === this.selectedOption)!;

    if (!this.searchQuery.trim()) {
      this.errorService.handleError("Please enter a value to search");
      return;
    }

    if (option.type === 'number' && !/^\d+$/.test(this.searchQuery)) {
      this.errorService.handleErrorMessage(`${option.label} must be a ${option.type}`);
      return
    }

    this.searchEvent.emit({option: this.selectedOption, value: this.searchQuery});
  }
}
