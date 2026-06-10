import { TimerPort } from "../../timer/timer.port";
import { GameView } from "./game.view";
import { RefreshGamePort } from "./refresh-game.port";

export class FetchGameUseCase {
    constructor(
        private readonly gameView: GameView,
        private readonly timerPort: TimerPort,
        private readonly refreshGameService: RefreshGamePort,
    ) { }

    async execute(): Promise<void> {
        this.timerPort.cancel();
        this.gameView.update({ isLoadingFetch: true });
        try {
            await this.refreshGameService.execute();
            this.gameView.update({ isErrorFetch: false });
        } catch {
            this.gameView.update({ isErrorFetch: true });
        }
        this.gameView.update({ isLoadingFetch: false });
    }
}
