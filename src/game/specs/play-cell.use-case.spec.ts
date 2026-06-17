import { AppParam } from "../../app/app.routes";
import { FakeSignalAdapter } from "../../signal/fake-signal.adapter";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { GameView } from "../core/game.view";
import { PlayCellUseCase } from "../core/play-cell.use-case";
import { GameViewModel } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";
import { FakeRefreshGameService } from "./fake-refresh-game.service";

describe('PlayCellUseCase', () => {
    let playCellUseCase: PlayCellUseCase;
    let fakeGameAdapter: FakeGameAdapter;
    let fakeRefreshGameService: FakeRefreshGameService;
    let gameView: GameView;
    let fakeUiAdapter: FakeUiAdapter;

    beforeEach(() => {
        fakeUiAdapter = new FakeUiAdapter();
        fakeUiAdapter.params[AppParam.GameId] = 'gameId';
        fakeUiAdapter.params[AppParam.PlayerId] = 'playerId';
        gameView = new GameView(new FakeSignalAdapter<GameViewModel>(), fakeUiAdapter);
        fakeGameAdapter = new FakeGameAdapter();
        fakeRefreshGameService = new FakeRefreshGameService();
        playCellUseCase = new PlayCellUseCase(gameView, fakeGameAdapter, fakeRefreshGameService);
    });

    it('should send the right cell with the right game and player to the port', async () => {
        expect(fakeGameAdapter.cell).toBeUndefined();

        await playCellUseCase.execute(3, 5);

        expect(fakeGameAdapter.cell).toEqual({ x: 3, y: 5, gameId: fakeUiAdapter.getParam(AppParam.GameId), playerId: fakeUiAdapter.getParam(AppParam.PlayerId) });
    });

    it('should not play if cell cannot be played', async () => {
        const cells = gameView.gameViewModel.get().cells;
        cells[0][0] = { ...cells[0][0], canPlay: false };
        gameView.update({ cells });

        expect(fakeGameAdapter.cell).toBeUndefined();

        await playCellUseCase.execute(0, 0);

        expect(fakeGameAdapter.cell).toBeUndefined();
        expect(fakeRefreshGameService.executeCallCount).toBe(0);
    });

    it('should display loading during play', async () => {
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);

        const promise = playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display loading during play failure', async () => {
        fakeGameAdapter.playError = new Error();

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);

        const promise = playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display error if play fails', async () => {
        fakeGameAdapter.playError = new Error();

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(false);

        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(true);
    });

    it('should display loading during refresh failure', async () => {
        fakeRefreshGameService.error = new Error();

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);

        const promise = playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);

        await promise;

        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display error if refresh fails', async () => {
        fakeRefreshGameService.error = new Error();

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(false);

        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(true);
    });

    it('should clear error on success after a failure', async () => {
        fakeGameAdapter.playError = new Error();
        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(true);

        fakeGameAdapter.playError = undefined;
        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(false);
    });

    it('should clear error on success after a refresh failure', async () => {
        fakeRefreshGameService.error = new Error();
        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(true);

        fakeRefreshGameService.error = undefined;
        await playCellUseCase.execute(0, 0);

        expect(gameView.gameViewModel.get().isErrorPlay).toBe(false);
    });

    it('should call refresh service after successful play', async () => {
        expect(fakeRefreshGameService.executeCallCount).toBe(0);

        await playCellUseCase.execute(0, 0);

        expect(fakeRefreshGameService.executeCallCount).toBe(1);
    });
});
