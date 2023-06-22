import { Component } from '@angular/core';
import { ChildActivationEnd, Router } from '@angular/router';
import { Observable, filter, first, map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  firstRouteLoaded$: Observable<boolean>;

  constructor(private router: Router) {
    this.firstRouteLoaded$ = router.events.pipe(
      filter(event => event instanceof ChildActivationEnd),
      first(),
      map(() => {
        return true;
      }))
  }
}
