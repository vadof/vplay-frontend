import { Injectable } from '@angular/core';
import confetti from "canvas-confetti";

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {

  private myConfetti = confetti.create(undefined, { resize: true });

  launchConfetti() {
    this.myConfetti({
      particleCount: 50,
      angle: 180,
      spread: 360,
      ticks: 75,
      scalar: 2,
      shapes: ['circle'],
      gravity: 0.5,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#f3ba2f'],
    });
  }
}
