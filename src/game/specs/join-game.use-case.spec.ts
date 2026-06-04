import { AppParam, AppPath } from "../../app/app.routes";
import { FakeSignalWrapper } from "../../signal/fake-signal.wrapper";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { GameView } from "../core/game.view";
import { JoinGameUseCase } from "../core/join-game.use-case";
import { GameViewModel } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";

describe('JoinGameUseCase', () => {
    let joinGameUseCase: JoinGameUseCase;
    let gameView: GameView;
    let fakeGameAdapter: FakeGameAdapter;
    let fakeUiWrapper: FakeUiWrapper;

    beforeEach(() => {
        fakeUiWrapper = new FakeUiWrapper();
        gameView = new GameView(new FakeSignalWrapper<GameViewModel>(), fakeUiWrapper);
        fakeGameAdapter = new FakeGameAdapter();
        joinGameUseCase = new JoinGameUseCase(gameView, fakeGameAdapter);
    })

    it('should join the right game', async () => {
        const gameId = 'gameId';
        fakeUiWrapper.params[AppParam.GameId] = gameId;

        expect(fakeGameAdapter.joinedGameId).toBeUndefined();

        joinGameUseCase.execute();

        expect(fakeGameAdapter.joinedGameId).toBe(gameId);
    });

    it('should navigate to game', async () => {
        expect(fakeUiWrapper.path).toBeUndefined();
        await joinGameUseCase.execute();
        expect(fakeUiWrapper.path).toBe(AppPath.Games + '/' + fakeGameAdapter.newGameJoined.id + '/' + AppPath.Players + '/' + fakeGameAdapter.newGameJoined.playerId);
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