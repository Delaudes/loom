import { NewGameDomainModel } from "../models/game.domain.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";

export class JoinGameUseCase {
    constructor(private readonly gameView: GameView, private readonly gamePort: GamePort) { }

    async execute(): Promise<void> {
        this.startLoadingJoinGame();
        try {
            const gameId = this.gameView.fetchGameId();
            const game = await this.gamePort.joinGame(gameId);
            this.presentJoinGame(game)
        } catch {
            this.presentErrorJoinGame()
        }
        this.stopLoadingJoinGame();
    }

    private startLoadingJoinGame(): void {
        this.gameView.update({ isLoadingJoin: true });
    }

    private stopLoadingJoinGame(): void {
        this.gameView.update({ isLoadingJoin: false });
    }

    private presentErrorJoinGame(): void {
        this.gameView.update({ isErrorJoin: true });
    }

    private presentJoinGame(newGame: NewGameDomainModel): void {
        this.gameView.update({ isErrorJoin: false });
        this.gameView.navigateToGame(newGame.id, newGame.playerId);
    }
}