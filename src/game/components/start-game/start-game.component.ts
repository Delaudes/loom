import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StartGameUseCase } from '../../core/start-game.use-case';

@Component({
  selector: 'app-start-game',
  imports: [],
  templateUrl: './start-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartGameComponent {
  protected readonly startGameUseCase = inject(StartGameUseCase);
}
