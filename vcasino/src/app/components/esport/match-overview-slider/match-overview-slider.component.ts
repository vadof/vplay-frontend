import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IMatch} from "../../../models/esport/IMatch";
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {ISelectedMarket} from "../../../models/esport/ISelectedMarket";
import {IMarket} from "../../../models/esport/IMarket";

@Component({
  selector: 'app-match-overview-slider',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './match-overview-slider.component.html',
  styleUrl: './match-overview-slider.component.scss'
})
export class MatchOverviewSliderComponent implements OnInit {
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
  @Input({required: true}) matches: IMatch[] = [];
  @Input({required: true}) selectedMarket: ISelectedMarket | null = null;
  @Output() selectMatchEvent: EventEmitter<IMatch> = new EventEmitter<IMatch>;
  @Output() selectMarketEvent: EventEmitter<ISelectedMarket | null> = new EventEmitter<ISelectedMarket | null>;

  private scrollAmount: number = 225;

  ngOnInit(): void {
  }

  scrollLeft(): void {
    const el = this.scrollContainer.nativeElement;
    const maxScroll: number = el.scrollWidth - el.clientWidth;
    const currentScroll: number = el.scrollLeft;

    let scrollBy: number = -this.scrollAmount;
    if (currentScroll === 0) {
      scrollBy = maxScroll;
    }

    this.scrollContainer.nativeElement.scrollBy({
      left: scrollBy,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    const el = this.scrollContainer.nativeElement;
    const maxScroll: number = el.scrollWidth - el.clientWidth;
    const currentScroll: number = el.scrollLeft;

    let scrollBy: number = this.scrollAmount;
    if (currentScroll === maxScroll) {
      scrollBy = -maxScroll;
    }

    console.log(maxScroll);
    console.log(currentScroll);

    this.scrollContainer.nativeElement.scrollBy({
      left: scrollBy,
      behavior: 'smooth'
    });
  }

  selectMatch(match: IMatch) {
    this.selectMatchEvent.emit(match);
  }

  selectMarket(market: IMarket, match: IMatch) {
    console.log("SELECTED")
    if (this.selectedMarket !== null && this.selectedMarket.market.id === market.id) {
      this.selectedMarket = null;
    } else {
      this.selectedMarket = {market, match};
    }
    this.selectMarketEvent.emit(this.selectedMarket);
  }

}
