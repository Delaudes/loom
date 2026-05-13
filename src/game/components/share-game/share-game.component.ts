import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameView } from '../../core/game.view';

@Component({
  selector: 'app-share-game',
  imports: [],
  templateUrl: './share-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareGameComponent {
  protected readonly gameView = inject(GameView);
}
