import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FetchGameUseCase } from '../core/fetch-game.use-case';
import { GameView } from '../core/game.view';
import { GameBoardComponent } from "./game-board/game-board.component";
import { HeaderGameComponent } from './header-game/header-game.component';

@Component({
  selector: 'app-game',
  imports: [HeaderGameComponent, GameBoardComponent],
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
