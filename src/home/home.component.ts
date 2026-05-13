import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StartGameComponent } from "../game/components/start-game/start-game.component";

@Component({
  selector: 'app-home',
  imports: [StartGameComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
