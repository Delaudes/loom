import { AppParam, AppPath } from "../../app/app.routes";
import { FakeSignalAdapter } from "../../signal/fake-signal.adapter";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { GameView } from "../core/game.view";
import { JoinGameUseCase } from "../core/join-game.use-case";
import { GameViewModel } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";

describe('JoinGameUseCase', () => {
    let joinGameUseCase: JoinGameUseCase;
    let gameView: GameView;
    let fakeGameAdapter: FakeGameAdapter;
    let fakeUiAdapter: FakeUiAdapter;

    beforeEach(() => {
        fakeUiAdapter = new FakeUiAdapter();
        gameView = new GameView(new FakeSignalAdapter<GameViewModel>(), fakeUiAdapter);
        fakeGameAdapter = new FakeGameAdapter();
        joinGameUseCase = new JoinGameUseCase(gameView, fakeGameAdapter);
    })

    it('should join the right game', async () => {
        const gameId = 'gameId';
        fakeUiAdapter.params[AppParam.GameId] = gameId;

        expect(fakeGameAdapter.joinedGameId).toBeUndefined();

        joinGameUseCase.execute();

        expect(fakeGameAdapter.joinedGameId).toBe(gameId);
    });

    it('should navigate to game', async () => {
        expect(fakeUiAdapter.path).toBeUndefined();
        await joinGameUseCase.execute();
        expect(fakeUiAdapter.path).toBe(AppPath.Games + '/' + fakeGameAdapter.newGameJoined.id + '/' + AppPath.Players + '/' + fakeGameAdapter.newGameJoined.playerId);
    });

    it('should remove displayed error if game join succeeds after failure', async () => {
        gameView.update({ isErrorJoin: true });
        expect(gameView.gameViewModel.get().isErrorJoin).toBe(true);
        await joinGameUseCase.execute();
        expect(gameView.gameViewModel.get().isErrorJoin).toBe(false);
    });

    it('should display error if game join fails', async () => {
        fakeGameAdapter.error = new Error();

        expect(gameView.gameViewModel.get().isErrorJoin).toBe(false);

        await joinGameUseCase.execute();

        expect(gameView.gameViewModel.get().isErrorJoin).toBe(true);
    });

    it('should display loading during game join success', async () => {
        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(false);

        const promise = joinGameUseCase.execute();

        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(false);
    });

    it('should display loading during game join failure', async () => {
        fakeGameAdapter.error = new Error();

        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(false);

        const promise = joinGameUseCase.execute();

        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingJoin).toBe(false);
    });
});