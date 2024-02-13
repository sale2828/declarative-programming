import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSliderDragEvent } from '@angular/material/slider';
import { BehaviorSubject, EMPTY, NEVER, combineLatest, concatMap, delayWhen, expand, from, iif, of, switchMap, timer } from 'rxjs';
import { photos } from 'src/assets/slideshow-images';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideshowComponent {
  currentPhotos$ = new BehaviorSubject<string[]>(photos);
  paused$ = new BehaviorSubject(false);
  delayTime$ = new BehaviorSubject(1000);
  loop$ = new BehaviorSubject(true);
  staticPhoto$ = new BehaviorSubject<string | null>(null)

  calculateDelay$ = combineLatest([this.paused$, this.delayTime$]).pipe(
    switchMap(([isPaused, delayTime]) =>
      iif(() =>
        isPaused, NEVER, timer(delayTime))
    )
  );

  // Emit one photo at a time with a delay
  playCurrentPhotos$ = this.currentPhotos$.pipe(
    switchMap((photos) => from(photos)),
    concatMap((photo) => of(photo).pipe(delayWhen(() => this.calculateDelay$)))
  );


  currentPhoto$ = combineLatest([this.currentPhotos$, this.staticPhoto$]).pipe(
    switchMap(([_, staticPhoto]) =>
      iif(
        () => staticPhoto !== null,
        of(staticPhoto),
        this.playCurrentPhotos$.pipe(
          expand((photo) => {
            const currentPhotos = this.currentPhotos$.value;
            const isLastPhoto = photo === currentPhotos[currentPhotos.length - 1];
            return isLastPhoto && this.loop$.value
              ? this.playCurrentPhotos$ : EMPTY;
          })
        )
      )
    )
  )

  // nextPhoto(currentPhoto: string) {
  //   this.paused$.next(true);
  //   const currentPhotos = this.currentPhotos$.value;
  //   const currentlndex = currentPhotos.indexOf(currentPhoto);

  //   const nextIndex = currentlndex < currentPhotos.length - 1 ? currentlndex + 1 : 0;
  //   this.staticPhoto$.next(currentPhotos[nextIndex]);
  // }

  // prevPhoto(currentPhoto: string) {
  //   this.paused$.next(true);
  //   const currentPhotos = this.currentPhotos$.value;
  //   const currentIndex = currentPhotos.indexOf(currentPhoto);
  //   const prevlndex = currentIndex > 0 ? currentIndex - 1 : currentPhotos.length - 1;
  //   this.staticPhoto$.next(currentPhotos[prevlndex]);
  // }


  changeDelay(ev: Event) {
    this.delayTime$.next((ev.target as unknown as MatSliderDragEvent).value);
  }

  // toggleLoop(ev: MatSlideToggleChange) {
  //   this.loop$.next(ev.checked);
  // }

}
