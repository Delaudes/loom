import { AppParam } from "../../app/app.routes";
import { FakeSignalWrapper } from "../../signal/fake-signal.wrapper";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { FetchGameUseCase } from "../core/fetch-game.use-case";
import { GameView } from "../core/game.view";
import { ActionDomainModel, ActionTypeDomainEnum, PositionDomainModel } from "../models/game.domain.model";
import { GameViewModel, OwnerViewEnum, StatusViewEnum } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";

describe('FetchGameUseCase', () => {
    let fetchGameUseCase: FetchGameUseCase;
    let fakeGameAdapter: FakeGameAdapter;
    let gameView: GameView;
    let fakeUiWrapper: FakeUiWrapper;

    beforeEach(() => {
        fakeUiWrapper = new FakeUiWrapper();
        gameView = new GameView(new FakeSignalWrapper<GameViewModel>(), fakeUiWrapper);
        fakeGameAdapter = new FakeGameAdapter();
        fetchGameUseCase = new FetchGameUseCase(gameView, fakeGameAdapter);
    })

    it('should fetch the right game for the right player', () => {
        expect(fakeGameAdapter.fetchedGameId).toBeUndefined();
        expect(fakeGameAdapter.fetchedPlayerId).toBeUndefined();
        const gameId = 'gameId';
        const playerId = 'playerId';
        fakeUiWrapper.params[AppParam.GameId] = gameId
        fakeUiWrapper.params[AppParam.PlayerId] = playerId
        fetchGameUseCase.execute();
        expect(fakeGameAdapter.fetchedGameId).toBe(gameId);
        expect(fakeGameAdapter.fetchedPlayerId).toBe(playerId);
    });

    it('should display loading during game fetching', async () => {
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
        const promise = fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);
        await promise;
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display error if game fetching fails', async () => {
        expect(gameView.gameViewModel.get().isErrorFetch).toBe(false);
        fakeGameAdapter.error = new Error();
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get().isErrorFetch).toBe(true);
    });

    it('should display loading during game fetching failure', async () => {
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
        fakeGameAdapter.error = new Error();
        const promise = fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(true);
        await promise;
        expect(gameView.gameViewModel.get().isLoadingFetch).toBe(false);
    });

    it('should display game a te the beginning', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        expectedGame.status = StatusViewEnum.FirstPlace;
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after first placement', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        expectedGame.status = StatusViewEnum.SecondPlace;
        expectedGame.cells[0][0].canPlay = false
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after second placement', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)));
        expectedGame.status = StatusViewEnum.ThirdPlace;
        expectedGame.cells[0][0].canPlay = false
        expectedGame.cells[0][1].canPlay = false
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after third placement', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)));
        expectedGame.status = StatusViewEnum.FirstPredict;
        expectedGame.cells[0][0].canPlay = false
        expectedGame.cells[0][1].canPlay = false
        expectedGame.cells[0][2].canPlay = false
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after first prediction', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 0)));
        expectedGame.status = StatusViewEnum.SecondPredict;
        expectedGame.cells[0][0].canPlay = false
        expectedGame.cells[0][1].canPlay = false
        expectedGame.cells[0][2].canPlay = false
        expectedGame.cells[2][0].canPlay = false
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after round complete', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        simulateFirstPlayerRound();
        expectedGame.status = StatusViewEnum.WaitingOpponent;
        expectedGame.cells[0][0].canPlay = false
        expectedGame.cells[0][1].canPlay = false
        expectedGame.cells[0][2].canPlay = false
        expectedGame.cells[2][0].canPlay = false
        expectedGame.cells[3][0].canPlay = false
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game cells owner', async () => {
        const expectedGame = gameViewModelInit();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
        simulateFirstPlayerRound();
        simulateFirstOpponentRound();
        simulateFirstRound(expectedGame);
        await fetchGameUseCase.execute();
        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    })

    function simulateFirstPlayerRound() {
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 0)));
        fakeGameAdapter.game.playerActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(3, 0)));
    }

    function simulateFirstOpponentRound() {
        fakeGameAdapter.game.opponentActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)));
        fakeGameAdapter.game.opponentActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(1, 0)));
        fakeGameAdapter.game.opponentActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(2, 0)));
        fakeGameAdapter.game.opponentActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 3)));
        fakeGameAdapter.game.opponentActions.push(new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 2)));
    }

    function simulateFirstRound(expectedGame: GameViewModel) {
        expectedGame.status = StatusViewEnum.FirstPlace;
        expectedGame.cells[0][1].owner = OwnerViewEnum.Player;
        expectedGame.cells[0][2].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[1][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[2][0].owner = OwnerViewEnum.Player;
        expectedGame.cells[0][1].canPlay = false;
        expectedGame.cells[0][2].canPlay = false;
        expectedGame.cells[1][0].canPlay = false;
        expectedGame.cells[2][0].canPlay = false;
    }
})

const gameViewModelInit = (): GameViewModel => {
    return {
        isLoadingCreate: false,
        isLoadingFetch: false,
        isErrorCreate: false,
        isErrorFetch: false,
        cells: Array.from({ length: 8 }, (_, x) =>
            Array.from({ length: 8 }, (_, y) => ({
                x,
                y,
                owner: OwnerViewEnum.None,
                canPlay: true
            }))
        )
    };
}