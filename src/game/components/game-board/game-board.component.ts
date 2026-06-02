import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameView } from '../../core/game.view';
import { CellComponent } from "../cell/cell.component";

@Component({
  selector: 'app-game-board',
  imports: [CellComponent],
  templateUrl: './game-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  protected readonly gameView = inject(GameView);
}
