import { TimerPort } from "../../timer/timer.port";
import { GameDomainModel, OwnedPositionsDomainModel, OwnerDomainEnum } from "../models/game.domain.model";
import { CellViewModel, OwnerViewEnum, StatusViewEnum } from "../models/game.view.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";

export class RefreshGameService {
    constructor(
        private readonly gameView: GameView,
        private readonly gamePort: GamePort,
        private readonly timerPort: TimerPort,
    ) { }

    async execute(): Promise<void> {
        const gameId = this.gameView.fetchGameId();
        const playerId = this.gameView.fetchPlayerId();
        const game = await this.gamePort.fetchGame(gameId, playerId);
        this.presentGame(game);
        this.scheduleNextFetchIfWaiting(game);
    }

    private scheduleNextFetchIfWaiting(game: GameDomainModel): void {
        if (game.isWaitingForOpponent()) {
            this.timerPort.scheduleOnce(() => this.execute(), 5000);
        }
    }

    private presentGame(game: GameDomainModel): void {
        const status = this.getStatus(game);
        const ownedPositions = game.ownedPositions;
        const cells = this.gameView.gameViewModel.get().cells.map(row => row.map(cell => {
            const owner = this.getOwner(cell, ownedPositions);
            return {
                ...cell,
                owner,
                canPlay: game.canPlayAt(cell.x, cell.y),
                isPlayedInCurrentRound: game.hasPlayedInCurrentRound(cell.x, cell.y)
            };
        }));
        this.gameView.update({ status, cells, round: `${game.round}/${game.maxRound}` });
    }

    private getStatus(game: GameDomainModel): StatusViewEnum | undefined {
        const nextAction = game.nextPlayerAction;
        if (nextAction?.isFirstPlaceAction()) return StatusViewEnum.FirstPlace;
        if (nextAction?.isSecondPlaceAction()) return StatusViewEnum.SecondPlace;
        if (nextAction?.isThirdPlaceAction()) return StatusViewEnum.ThirdPlace;
        if (nextAction?.isFirstPredictAction()) return StatusViewEnum.FirstPredict;
        if (nextAction?.isSecondPredictAction()) return StatusViewEnum.SecondPredict;
        if (game.isFinished()) {
            if (game.isPlayerWin()) return StatusViewEnum.Win;
            if (game.isOpponentWin()) return StatusViewEnum.Lost;
            return StatusViewEnum.NoWinner;
        }
        return StatusViewEnum.WaitingOpponent;
    }

    private getOwner(cell: CellViewModel, ownedPositions: OwnedPositionsDomainModel): OwnerViewEnum {
        const ownerMap: Record<OwnerDomainEnum, OwnerViewEnum> = {
            [OwnerDomainEnum.Player]: OwnerViewEnum.Player,
            [OwnerDomainEnum.Opponent]: OwnerViewEnum.Opponent,
            [OwnerDomainEnum.None]: OwnerViewEnum.None,
        };
        return ownerMap[ownedPositions.ownerAt(cell.x, cell.y)];
    }
}
