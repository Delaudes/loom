import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AngularSignalAdapter } from '../../../signal/angular-signal.adapter';
import { SignalPort } from '../../../signal/signal.port';
import { GameView } from '../../core/game.view';
import { CellComponent } from "../cell/cell.component";

const CELL_SIZE = 40;
const GRID_SIZE = 8;
const DURATION = 200;

@Component({
  selector: 'app-game-board',
  imports: [CellComponent],
  templateUrl: './game-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  protected readonly gameView = inject(GameView);

  private readonly rowOffset: SignalPort<number> = new AngularSignalAdapter();
  private readonly colOffset: SignalPort<number> = new AngularSignalAdapter();
  protected readonly tx: SignalPort<number> = new AngularSignalAdapter();
  protected readonly ty: SignalPort<number> = new AngularSignalAdapter();
  protected readonly animated: SignalPort<boolean> = new AngularSignalAdapter();

  constructor() {
    this.rowOffset.set(0);
    this.colOffset.set(0);
    this.tx.set(0);
    this.ty.set(0);
    this.animated.set(false);
  }

  protected get colLabels(): string[] {
    return this.shiftedCells[0].map(cell => String.fromCharCode(65 + cell.y));
  }

  protected get rowLabels(): number[] {
    return this.shiftedCells.map(row => row[0].x + 1);
  }

  protected get shiftedCells() {
    const cells = this.gameView.gameViewModel.get().cells;
    const ro = this.rowOffset.get();
    const co = this.colOffset.get();
    return Array.from({ length: GRID_SIZE }, (_, i) =>
      Array.from({ length: GRID_SIZE }, (_, j) =>
        cells[(i + ro) % GRID_SIZE][(j + co) % GRID_SIZE]
      )
    );
  }

  protected shiftUp(): void {
    this.shift(0, -CELL_SIZE, () => this.rowOffset.update(o => (o + 1) % GRID_SIZE));
  }

  protected shiftDown(): void {
    this.shift(0, CELL_SIZE, () => this.rowOffset.update(o => (o - 1 + GRID_SIZE) % GRID_SIZE));
  }

  protected shiftLeft(): void {
    this.shift(-CELL_SIZE, 0, () => this.colOffset.update(o => (o + 1) % GRID_SIZE));
  }

  protected shiftRight(): void {
    this.shift(CELL_SIZE, 0, () => this.colOffset.update(o => (o - 1 + GRID_SIZE) % GRID_SIZE));
  }

  private shift(tx: number, ty: number, updateOffset: () => void): void {
    if (this.animated.get()) return;
    this.animated.set(true);
    this.tx.set(tx);
    this.ty.set(ty);
    setTimeout(() => {
      this.animated.set(false);
      updateOffset();
      this.tx.set(0);
      this.ty.set(0);
    }, DURATION);
  }
}
