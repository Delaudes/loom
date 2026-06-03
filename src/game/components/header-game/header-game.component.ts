import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BackHomeComponent } from '../../../home/back-home/back-home.component';
import { GameRulesComponent } from '../game-rules/game-rules.component';
import { ShareGameComponent } from '../share-game/share-game.component';

@Component({
  selector: 'app-header-game',
  imports: [BackHomeComponent, ShareGameComponent, GameRulesComponent],
  templateUrl: './header-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderGameComponent {}
