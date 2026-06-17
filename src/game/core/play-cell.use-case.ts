import { CellDomainModel } from "../models/game.domain.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";
import { RefreshGamePort } from "./refresh-game.port";

export class PlayCellUseCase {
    constructor(
        private readonly gameView: GameView,
        private readonly gamePort: GamePort,
        private readonly refreshGameService: RefreshGamePort,) { }

    async execute(x: number, y: number): Promise<void> {
        const game = this.gameView.gameViewModel.get()
        const cell = game?.cells.flatMap(row => row).find(cell => cell.x === x && cell.y === y);
        const gameId = this.gameView.fetchGameId();
        const playerId = this.gameView.fetchPlayerId();
        if (cell?.canPlay) {
            this.gameView.update({ isLoadingFetch: true });
            try {
                const cellDomainModel = new CellDomainModel(x, y, gameId, playerId);
                await this.gamePort.playCell(cellDomainModel);
                await this.refreshGameService.execute();
                this.gameView.update({ isErrorPlay: false });
            } catch (error) {
                this.gameView.update({ isErrorPlay: true });
            }
            this.gameView.update({ isLoadingFetch: false });
        }
    }
}