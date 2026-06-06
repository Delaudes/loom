import { InjectionToken } from "@angular/core";
import { AngularSignalWrapper } from "../signal/angular-signal.wrapper";
import { TIMER_TOKEN } from "../timer/timer.provider";
import { UiPort } from "../ui/ui.port";
import { UI_TOKEN } from "../ui/ui.provider";
import { GamePort } from "./core/game.port";
import { FetchGameUseCase } from "./core/fetch-game.use-case";
import { GameView } from "./core/game.view";
import { JoinGameUseCase } from "./core/join-game.use-case";
import { RefreshGameService } from "./core/refresh-game.service";
import { StartGameUseCase } from "./core/start-game.use-case";
import { InMemoryGameAdapter } from "./in-memory-game.adapter";
import { GameViewModel } from "./models/game.view.model";

export const GAME_TOKEN = new InjectionToken<GamePort>('GAME_TOKEN', {
    providedIn: 'root',
    factory: () => new InMemoryGameAdapter()
});


export const GAME_PROVIDERS = [
    {
        provide: RefreshGameService,
        deps: [GameView, GAME_TOKEN, TIMER_TOKEN],
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
        useFactory: (uiPort: UiPort) => new GameView(new AngularSignalWrapper<GameViewModel>(), uiPort),
        deps: [UI_TOKEN],
    }
];