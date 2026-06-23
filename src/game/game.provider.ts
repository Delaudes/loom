import { inject, InjectionToken } from "@angular/core";
import { environment } from "../environments/environment";
import { HTTP_TOKEN } from "../http/http.provider";
import { AngularSignalAdapter } from "../signal/angular-signal.adapter";
import { TIMER_TOKEN } from "../timer/timer.provider";
import { UiPort } from "../ui/ui.port";
import { UI_TOKEN } from "../ui/ui.provider";
import { FetchGameUseCase } from "./core/fetch-game.use-case";
import { GamePort } from "./core/game.port";
import { GameView } from "./core/game.view";
import { JoinGameUseCase } from "./core/join-game.use-case";
import { PlayCellUseCase } from "./core/play-cell.use-case";
import { RefreshGameService } from "./core/refresh-game.service";
import { StartGameUseCase } from "./core/start-game.use-case";
import { HttpGameAdapter } from "./http-game.adapter";
import { LocalStorageGameAdapter } from "./local-storage-game.adapter";
import { GameViewModel } from "./models/game.view.model";

export const GAME_TOKEN = new InjectionToken<GamePort>('GAME_TOKEN', {
    providedIn: 'root',
    factory: () => environment.useLocalStorageGameAdapter ? new LocalStorageGameAdapter() : new HttpGameAdapter(inject(HTTP_TOKEN))
});


export const GAME_PROVIDERS = [
    {
        provide: RefreshGameService,
        deps: [GameView, GAME_TOKEN, TIMER_TOKEN],
    },
    {
        provide: PlayCellUseCase,
        deps: [GameView, GAME_TOKEN, RefreshGameService],
    },
    {
        provide: FetchGameUseCase,
        deps: [GameView, TIMER_TOKEN, RefreshGameService],
    },
    {
        provide: StartGameUseCase,
        deps: [GameView, GAME_TOKEN],
    },
    {
        provide: JoinGameUseCase,
        deps: [GameView, GAME_TOKEN],
    },
    {
        provide: GameView,
        useFactory: (uiPort: UiPort) => new GameView(new AngularSignalAdapter<GameViewModel>(), uiPort),
        deps: [UI_TOKEN],
    }
];