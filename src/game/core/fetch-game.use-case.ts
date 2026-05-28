import { GameDomainModel, OwnedPositionsDomainModel } from "../models/game.domain.model";
import { CellViewModel, OwnerViewEnum, StatusViewEnum } from "../models/game.view.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";

export class FetchGameUseCase {
    constructor(private readonly gameView: GameView, private readonly gamePort: GamePort) { }

    async execute(): Promise<void> {
        this.startLoadingFetchGame();
        try {
            const gameId = this.gameView.fetchGameId();
            const playerId = this.gameView.fetchPlayerId();
            const game = await this.gamePort.fetchGame(gameId, playerId);
            this.presentFetchGame(game)
        } catch {
            this.presentErrorFetchGame()
        }
        this.stopLoadingFetchGame();
    }

    private startLoadingFetchGame(): void {
        this.gameView.update({ isLoadingFetch: true });
    }

    private stopLoadingFetchGame(): void {
        this.gameView.update({ isLoadingFetch: false });
    }

    private presentErrorFetchGame(): void {
        this.gameView.update({ isErrorFetch: true });
    }

    private presentFetchGame(game: GameDomainModel): void {
        const status = this.getStatus(game);
        const ownedPositions = game.ownedPositions;
        const cells = this.gameView.gameViewModel.get().cells.map(row => row.map(cell => {
            const owner = this.getOwner(cell, ownedPositions)
            return {
                ...cell,
                owner,
                canPlay: owner === OwnerViewEnum.None && !game.hasPlayedInCurrentRound(cell.x, cell.y)
            }
        }))
        this.gameView.update({ isErrorFetch: false, status, cells });
    }

    private getStatus(game: GameDomainModel): StatusViewEnum | undefined {
        const nextAction = game.nextPlayerAction;
        if (nextAction?.isFirstPlaceAction()) {
            return StatusViewEnum.FirstPlace;
        }
        if (nextAction?.isSecondPlaceAction()) {
            return StatusViewEnum.SecondPlace;
        }
        if (nextAction?.isThirdPlaceAction()) {
            return StatusViewEnum.ThirdPlace;
        }
        if (nextAction?.isFirstPredictAction()) {
            return StatusViewEnum.FirstPredict;
        }
        if (nextAction?.isSecondPredictAction()) {
            return StatusViewEnum.SecondPredict;
        }
        if (game.isFinished()) {
            if (game.isPlayerWin()) {
                return StatusViewEnum.Win
            }
            if (game.isOpponentWin()) {
                return StatusViewEnum.Lost
            }
            return StatusViewEnum.NoWinner
        }
        return StatusViewEnum.WaitingOpponent;
    }

    private getOwner(cell: CellViewModel, ownedPositions: OwnedPositionsDomainModel): OwnerViewEnum {
        if (ownedPositions.hasPlayerOwnedPosition(cell.x, cell.y)) {
            return OwnerViewEnum.Player;
        }
        if (ownedPositions.hasOpponentOwnedPosition(cell.x, cell.y)) {
            return OwnerViewEnum.Opponent;
        }
        return OwnerViewEnum.None;
    }
}