import { GameDomainModel } from "../models/game.domain.model";
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
        } finally {
            this.stopLoadingStartGame();
        }
    }

    startLoadingStartGame(): void {
        this.gameView.update({ isLoading: true });
    }

    stopLoadingStartGame(): void {
        this.gameView.update({ isLoading: false });
    }

    presentErrorStartGame(): void {
        this.gameView.update({ isError: true });
    }

    presentStartGame(game: GameDomainModel): void {
        this.gameView.update({ isError: false });
        this.gameView.navigateToGame(game.id, game.playerId);
    }
}