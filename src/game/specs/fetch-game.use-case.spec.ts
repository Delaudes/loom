import { FakeSignalWrapper } from "../../signal/fake-signal.wrapper";
import { FakeTimerWrapper } from "../../timer/fake-timer.wrapper";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { FetchGameUseCase } from "../core/fetch-game.use-case";
import { GameView } from "../core/game.view";
import { GameViewModel } from "../models/game.view.model";
import { FakeRefreshGameService } from "./fake-refresh-game.service";

describe('FetchGameUseCase', () => {
    let fetchGameUseCase: FetchGameUseCase;
    let fakeRefreshGameService: FakeRefreshGameService;
    let fakeTimerWrapper: FakeTimerWrapper;
    let gameView: GameView;

    beforeEach(() => {
        const fakeUiWrapper = new FakeUiWrapper();
        gameView = new GameView(new FakeSignalWrapper<GameViewModel>(), fakeUiWrapper);
        fakeTimerWrapper = new FakeTimerWrapper();
        fakeRefreshGameService = new FakeRefreshGameService();
        fetchGameUseCase = new FetchGameUseCase(gameView, fakeTimerWrapper, fakeRefreshGameService);
    });

    it('should cancel any pending refetch at the start of execute', async () => {
        expect(fakeTimerWrapper.cancelCallCount).toBe(0);

        await fetchGameUseCase.execute();

        expect(fakeTimerWrapper.cancelCallCount).toBe(1);

        await fetchGameUseCase.execute();

        expect(fakeTimerWrapper.cancelCallCount).toBe(2);
    });

    it('should display loading during game fetching', async () => {
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);

        const promise = fetchGameUseCase.execute();

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display loading during game fetching failure', async () => {
        fakeRefreshGameService.error = new Error();

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);

        const promise = fetchGameUseCase.execute();

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display error if game fetching fails', async () => {
        fakeRefreshGameService.error = new Error();

        expect(gameView.gameViewModel.get().isErrorFetch).toBe(false);

        await fetchGameUseCase.execute();

        expect(gameView.gameViewModel.get().isErrorFetch).toBe(true);
    });

    it('should clear error on success after a failure', async () => {
        fakeRefreshGameService.error = new Error();
        await fetchGameUseCase.execute();

        expect(gameView.gameViewModel.get().isErrorFetch).toBe(true);

        fakeRefreshGameService.error = undefined;
        await fetchGameUseCase.execute();

        expect(gameView.gameViewModel.get().isErrorFetch).toBe(false);
    });
});
