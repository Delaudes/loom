import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PlayCellUseCase } from '../../core/play-cell.use-case';
import { CellViewModel, OwnerViewEnum } from '../../models/game.view.model';

@Component({
  selector: 'app-cell',
  imports: [],
  templateUrl: './cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  cell = input.required<CellViewModel>();
  protected readonly playCellUseCase = inject(PlayCellUseCase);
  protected readonly OwnerViewEnum = OwnerViewEnum;
}
