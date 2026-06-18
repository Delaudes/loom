import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RoundHistoryViewModel } from '../../models/game.view.model';

@Component({
    selector: 'app-game-history',
    imports: [],
    templateUrl: './game-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameHistoryComponent {
    readonly rounds = input.required<RoundHistoryViewModel[]>();
}
