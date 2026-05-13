import { AppParam, AppPath } from "../../app/app.routes";
import { SignalPort } from "../../signal/signal.port";
import { UiPort } from "../../ui/ui.port";
import { GameViewModel } from "../models/game.view.model";

export class GameView {

    constructor(public gameViewModel: SignalPort<GameViewModel>, private readonly uiPort: UiPort) {
        gameViewModel.set({
            isLoading: false,
            isError: false,
            board: {
                cells: [
                    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 }],
                    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 1, y: 7 }],
                    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 }],
                    [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }],
                    [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 }],
                    [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }],
                    [{ x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 6, y: 7 }],
                    [{ x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }]
                ]
            }
        });
    }

    update(partial: Partial<GameViewModel>): void {
        this.gameViewModel.update(viewModel => ({ ...viewModel, ...partial }));
    }

    navigateToGame(gameId: string, playerId: string): void {
        this.uiPort.navigate(AppPath.Games + '/' + gameId + '/' + AppPath.Players + '/' + playerId);
    }

    shareGame(): void {
        const gameId = this.uiPort.getParam(AppParam.GameId);
        this.uiPort.share(
            `Viens me défier sur LOOM !\n`,
            location.origin + '/' + AppPath.Games + '/' + gameId,
        );
    }
}