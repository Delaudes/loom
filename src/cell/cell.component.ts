import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CellViewModel } from '../game/models/game.view.model';

@Component({
  selector: 'app-cell',
  imports: [],
  templateUrl: './cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  cell = input.required<CellViewModel>();
}
