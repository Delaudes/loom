import { AppPath } from "../../app/app.routes";
import { FakeSignalWrapper } from "../../signal/fake-signal.wrapper";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { GameView } from "../core/game.view";
import { StartGameUseCase } from "../core/start-game.use-case";
import { GameViewModel } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";

describe('StartGameUseCase', () => {
    let startGameUseCase: StartGameUseCase;
    let gameView: GameView;
    let fakeGameAdapter: FakeGameAdapter;
    let fakeUiWrapper: FakeUiWrapper;

    beforeEach(() => {
        fakeUiWrapper = new FakeUiWrapper();
        gameView = new GameView(new FakeSignalWrapper<GameViewModel>(), fakeUiWrapper);
        fakeGameAdapter = new FakeGameAdapter();
        startGameUseCase = new StartGameUseCase(gameView, fakeGameAdapter);
    })

    it('should navigate to created game', async () => {
        expect(fakeUiWrapper.path).toBeUndefined();
        await startGameUseCase.execute();
        expect(fakeUiWrapper.path).toBe(AppPath.Games + '/' + fakeGameAdapter.newGame.id + '/' + AppPath.Players + '/' + fakeGameAdapter.newGame.playerId);
    });

    it('should remove displayed error if game creation succeeds after failure', async () => {
        gameView.update({ isErrorCreate: true });
        expect(gameView.gameViewModel.get().isErrorCreate).toBe(true);
        await startGameUseCase.execute();
        expect(gameView.gameViewModel.get().isErrorCreate).toBe(false);
    });

    it('should display error if game creation fails', async () => {
        expect(gameView.gameViewModel.get().isErrorCreate).toBe(false);
        fakeGameAdapter.error = new Error();
        await startGameUseCase.execute();
        expect(gameView.gameViewModel.get().isErrorCreate).toBe(true);
    });

    it('should display loading during game creation success', async () => {
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(false);
        const promise = startGameUseCase.execute();
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(true);
        await promise;
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(false);
    });

    it('should display loading during game creation failure', async () => {
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(false);
        fakeGameAdapter.error = new Error();
        const promise = startGameUseCase.execute();
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(true);
        await promise;
        expect(gameView.gameViewModel.get().isLoadingCreate).toBe(false);
    });
});