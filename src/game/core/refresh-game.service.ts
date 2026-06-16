import { TimerPort } from "../../timer/timer.port";
import { BOARD_SIZE, GameDomainModel, OwnedPositionsDomainModel, OwnerDomainEnum } from "../models/game.domain.model";
import { CurrentRoundActionViewEnum, OwnerViewEnum, StatusViewEnum } from "../models/game.view.model";
import { GamePort } from "./game.port";
import { GameView } from "./game.view";
import { RefreshGamePort } from "./refresh-game.port";

export class RefreshGameService implements RefreshGamePort {
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
        if (game.isWaitingForOpponent) {
            this.timerPort.scheduleOnce(() => this.execute(), 5000);
        }
    }

    private presentGame(game: GameDomainModel): void {
        const status = this.getStatus(game);
        const ownedPositions = game.ownedPositions;
        const cells = Array.from({ length: BOARD_SIZE }, (_, x) =>
            Array.from({ length: BOARD_SIZE }, (_, y) => ({
                x, y,
                owner: this.getOwner(x, y, ownedPositions),
                canPlay: game.canPlayAt(x, y),
                currentRoundAction: this.getCurrentRoundAction(game, x, y),
                isInPlayerLargestTerritory: ownedPositions.isInPlayerLargestTerritory(x, y),
                isInOpponentLargestTerritory: ownedPositions.isInOpponentLargestTerritory(x, y),
            }))
        );
        this.gameView.update({
            status, cells,
            round: `${game.round}/${game.maxRound}`,
            playerTerritorySize: ownedPositions.playerTerritorySize,
            opponentTerritorySize: ownedPositions.opponentTerritorySize,
        });
    }

    private getStatus(game: GameDomainModel): StatusViewEnum | undefined {
        const nextAction = game.nextPlayerAction;
        if (nextAction?.isFirstPlaceAction) return StatusViewEnum.FirstPlace;
        if (nextAction?.isSecondPlaceAction) return StatusViewEnum.SecondPlace;
        if (nextAction?.isThirdPlaceAction) return StatusViewEnum.ThirdPlace;
        if (nextAction?.isFirstPredictAction) return StatusViewEnum.FirstPredict;
        if (nextAction?.isSecondPredictAction) return StatusViewEnum.SecondPredict;
        if (game.isFinished) {
            if (game.isPlayerWin) return StatusViewEnum.Win;
            if (game.isOpponentWin) return StatusViewEnum.Lost;
            return StatusViewEnum.NoWinner;
        }
        return StatusViewEnum.WaitingOpponent;
    }

    private getCurrentRoundAction(game: GameDomainModel, x: number, y: number): CurrentRoundActionViewEnum {
        const index = game.currentRoundPlayerActions.findIndex(a => a.isAt(x, y));
        const map: CurrentRoundActionViewEnum[] = [
            CurrentRoundActionViewEnum.Place1,
            CurrentRoundActionViewEnum.Place2,
            CurrentRoundActionViewEnum.Place3,
            CurrentRoundActionViewEnum.Predict1,
            CurrentRoundActionViewEnum.Predict2,
        ];
        return map[index] ?? CurrentRoundActionViewEnum.None;
    }

    private getOwner(x: number, y: number, ownedPositions: OwnedPositionsDomainModel): OwnerViewEnum {
        const ownerMap: Record<OwnerDomainEnum, OwnerViewEnum> = {
            [OwnerDomainEnum.Player]: OwnerViewEnum.Player,
            [OwnerDomainEnum.Opponent]: OwnerViewEnum.Opponent,
            [OwnerDomainEnum.None]: OwnerViewEnum.None,
        };
        return ownerMap[ownedPositions.ownerAt(x, y)];
    }
}
