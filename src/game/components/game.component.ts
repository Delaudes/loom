import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FetchGameUseCase } from '../core/fetch-game.use-case';
import { GameView } from '../core/game.view';
import { GameBoardComponent } from "./game-board/game-board.component";
import { GameHistoryComponent } from "./game-history/game-history.component";
import { HeaderGameComponent } from './header-game/header-game.component';

@Component({
  selector: 'app-game',
  imports: [HeaderGameComponent, GameBoardComponent, GameHistoryComponent],
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class GameComponent implements OnInit {
  protected readonly gameView = inject(GameView);
  protected readonly fetchGameUseCase = inject(FetchGameUseCase);

  async ngOnInit(): Promise<void> {
    await this.fetchGameUseCase.execute();
  }
}
