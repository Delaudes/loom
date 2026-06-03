import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { JoinGameUseCase } from '../../core/join-game.use-case';
import { GameView } from '../../core/game.view';
import { HeaderGameComponent } from '../header-game/header-game.component';

@Component({
  selector: 'app-join-game',
  imports: [HeaderGameComponent],
  templateUrl: './join-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinGameComponent implements OnInit {
  protected readonly gameView = inject(GameView);
  protected readonly joinGameUseCase = inject(JoinGameUseCase);

  async ngOnInit(): Promise<void> {
    await this.joinGameUseCase.execute();
  }
}
