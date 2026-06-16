import { AppParam, AppPath } from "../../app/app.routes";
import { SignalPort } from "../../signal/signal.port";
import { UiPort } from "../../ui/ui.port";
import { BOARD_SIZE } from "../models/game.domain.model";
import { CurrentRoundActionViewEnum, GameViewModel, OwnerViewEnum } from "../models/game.view.model";

export class GameView {
    constructor(public readonly gameViewModel: SignalPort<GameViewModel>, private readonly uiPort: UiPort) {
        gameViewModel.set({
            isLoadingCreate: false,
            isLoadingFetch: false,
            isLoadingJoin: false,
            isErrorCreate: false,
            isErrorFetch: false,
            isErrorJoin: false,
            isErrorPlay: false,
            cells: Array.from({ length: BOARD_SIZE }, (_, x) =>
                Array.from({ length: BOARD_SIZE }, (_, y) => ({
                    x,
                    y,
                    owner: OwnerViewEnum.None,
                    canPlay: true,
                    currentRoundAction: CurrentRoundActionViewEnum.None,
                    isInPlayerLargestTerritory: false,
                    isInOpponentLargestTerritory: false
                }))
            ),
            round: '1/10',
            playerTerritorySize: 0,
            opponentTerritorySize: 0
        });
    }

    update(partial: Partial<GameViewModel>): void {
        this.gameViewModel.update(viewModel => ({ ...viewModel, ...partial }));
    }

    navigateToGame(gameId: string, playerId: string): void {
        this.uiPort.navigate(AppPath.Games + '/' + gameId + '/' + AppPath.Players + '/' + playerId);
    }

    shareGame(): void {
        const gameId = this.fetchGameId();
        this.uiPort.share(
            `Viens me défier sur LOOM !\n`,
            AppPath.Games + '/' + gameId,
        );
    }

    fetchGameId(): string {
        return this.uiPort.getParam(AppParam.GameId);
    }

    fetchPlayerId(): string {
        return this.uiPort.getParam(AppParam.PlayerId);
    }
}