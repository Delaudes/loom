import { FakeSignalAdapter } from "../../signal/fake-signal.adapter";
import { FakeTimerAdapter } from "../../timer/fake-timer.adapter";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { FetchGameUseCase } from "../core/fetch-game.use-case";
import { GameView } from "../core/game.view";
import { GameViewModel } from "../models/game.view.model";
import { FakeRefreshGameService } from "./fake-refresh-game.service";

describe('FetchGameUseCase', () => {
    let fetchGameUseCase: FetchGameUseCase;
    let fakeRefreshGameService: FakeRefreshGameService;
    let fakeTimerAdapter: FakeTimerAdapter;
    let gameView: GameView;

    beforeEach(() => {
        const fakeUiAdapter = new FakeUiAdapter();
        gameView = new GameView(new FakeSignalAdapter<GameViewModel>(), fakeUiAdapter);
        fakeTimerAdapter = new FakeTimerAdapter();
        fakeRefreshGameService = new FakeRefreshGameService();
        fetchGameUseCase = new FetchGameUseCase(gameView, fakeTimerAdapter, fakeRefreshGameService);
    });

    it('should cancel any pending refetch at the start of execute', async () => {
        expect(fakeTimerAdapter.cancelCallCount).toBe(0);

        await fetchGameUseCase.execute();

        expect(fakeTimerAdapter.cancelCallCount).toBe(1);

        await fetchGameUseCase.execute();

        expect(fakeTimerAdapter.cancelCallCount).toBe(2);
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
