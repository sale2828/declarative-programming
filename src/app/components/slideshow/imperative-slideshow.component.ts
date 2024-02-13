import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';

@Component({
  selector: 'app-slideshow',
  template: '',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideshowComponent implements OnChanges {
  @Input() photos!: string[];

  public currentPhoto?: string;
  public isPaused = false;
  private intervalRef?: NodeJS.Timer;
  private photoIndex = 0;

  constructor(
  ) { }

  ngOnChanges() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }

    this.photoIndex = this.photos.length - 1;
    this.currentPhoto = this.photos[this.photoIndex];
    this.photoIndex--;

    this.start();
  }

  start() {
    this.intervalRef = setInterval(() => {
      this.currentPhoto = this.photos[this.photoIndex];


      if (this.photoIndex < 1) {
        clearInterval(this.intervalRef);
      }

      this.photoIndex--;
    }, 2000);
  }

  pause() {
    this.isPaused = true;
    clearInterval(this.intervalRef);
  }

  unpause() {
    this.isPaused = false;
    this.start();
  }
}
