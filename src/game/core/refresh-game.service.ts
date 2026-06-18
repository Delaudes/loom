import { TimerPort } from "../../timer/timer.port";
import { BOARD_SIZE, GameDomainModel, OwnedPositionsDomainModel, OwnerDomainEnum, PositionDomainModel } from "../models/game.domain.model";
import { CurrentRoundActionViewEnum, OwnerViewEnum, RoundHistoryViewModel, StatusViewEnum } from "../models/game.view.model";
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
            history: this.computeRoundHistory(game),
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

    private computeRoundHistory(game: GameDomainModel): RoundHistoryViewModel[] {
        return game.roundResolutions.map(r => ({
            round: r.round,
            playerPlacements: `Vous avez posé en ${this.joinLabels(r.playerPlacements)}`,
            opponentPlacements: `L'adversaire a posé en ${this.joinLabels(r.opponentPlacements)}`,
            playerPredictions: `Vous avez prédit ${this.joinLabels(r.playerPredictions)}`,
            opponentPredictions: `L'adversaire a prédit ${this.joinLabels(r.opponentPredictions)}`,
            conflicts: r.conflicts.map(p => `Conflit en ${this.toPositionLabel(p)} — personne ne remporte la case`),
            playerSteals: r.playerSteals.map(p => `Vous avez prédit ${this.toPositionLabel(p)} — vous volez la case`),
            opponentSteals: r.opponentSteals.map(p => `L'adversaire a prédit ${this.toPositionLabel(p)} — il vous vole la case`),
            playerGains: r.playerGains.length > 0 ? `Vous remportez ${this.joinLabels(r.playerGains)}` : `Vous ne remportez aucune case`,
            opponentGains: r.opponentGains.length > 0 ? `L'adversaire remporte ${this.joinLabels(r.opponentGains)}` : `L'adversaire ne remporte aucune case`,
        })).reverse();
    }

    private joinLabels(positions: PositionDomainModel[]): string {
        const labels = positions.map(p => this.toPositionLabel(p));
        if (labels.length === 1) return labels[0];
        return labels.slice(0, -1).join(', ') + ' et ' + labels[labels.length - 1];
    }

    private toPositionLabel(position: PositionDomainModel): string {
        return String.fromCharCode(65 + position.y) + (position.x + 1);
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
