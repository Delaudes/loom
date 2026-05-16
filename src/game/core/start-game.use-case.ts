import { NewGameDomainModel } from "../models/game.domain.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";

export class StartGameUseCase {
    constructor(private readonly gameView: GameView, private readonly gamePort: GamePort) { }

    async execute(): Promise<void> {
        this.startLoadingStartGame();
        try {
            const game = await this.gamePort.createGame();
            this.presentStartGame(game);
        } catch {
            this.presentErrorStartGame()
        }
        this.stopLoadingStartGame();
    }

    private startLoadingStartGame(): void {
        this.gameView.update({ isLoadingCreate: true });
    }

    private stopLoadingStartGame(): void {
        this.gameView.update({ isLoadingCreate: false });
    }

    private presentErrorStartGame(): void {
        this.gameView.update({ isErrorCreate: true });
    }

    private presentStartGame(newGame: NewGameDomainModel): void {
        this.gameView.update({ isErrorCreate: false });
        this.gameView.navigateToGame(newGame.id, newGame.playerId);
    }
}