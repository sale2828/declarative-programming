import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutes } from '../../constants/app-routes';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  routes = AppRoutes;
}
