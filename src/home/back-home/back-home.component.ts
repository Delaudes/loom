import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HomeView } from '../core/home.view';

@Component({
  selector: 'app-back-home',
  imports: [],
  templateUrl: './back-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackHomeComponent {
  protected readonly homeView = inject(HomeView);
}
