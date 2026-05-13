import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BackHomeComponent } from "../../home/back-home/back-home.component";
import { GameBoardComponent } from "./game-board/game-board.component";
import { GameRulesComponent } from "./game-rules/game-rules.component";
import { ShareGameComponent } from './share-game/share-game.component';

@Component({
  selector: 'app-game',
  imports: [BackHomeComponent, ShareGameComponent, GameRulesComponent, GameBoardComponent],
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class GameComponent { }
