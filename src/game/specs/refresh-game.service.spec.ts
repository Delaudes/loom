import { AppParam } from "../../app/app.routes";
import { FakeSignalAdapter } from "../../signal/fake-signal.adapter";
import { FakeTimerAdapter } from "../../timer/fake-timer.adapter";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { GameView } from "../core/game.view";
import { RefreshGameService } from "../core/refresh-game.service";
import { ActionDomainModel, ActionTypeDomainEnum, PositionDomainModel } from "../models/game.domain.model";
import { CurrentRoundActionViewEnum, GameViewModel, OwnerViewEnum, RoundHistoryViewModel, StatusViewEnum } from "../models/game.view.model";
import { FakeGameAdapter } from "./fake-game.adapter";

describe('RefreshGameService', () => {
    let refreshGameService: RefreshGameService;
    let fakeGameAdapter: FakeGameAdapter;
    let fakeTimerAdapter: FakeTimerAdapter;
    let gameView: GameView;
    let fakeUiAdapter: FakeUiAdapter;

    beforeEach(() => {
        fakeUiAdapter = new FakeUiAdapter();
        gameView = new GameView(new FakeSignalAdapter<GameViewModel>(), fakeUiAdapter);
        fakeGameAdapter = new FakeGameAdapter();
        fakeTimerAdapter = new FakeTimerAdapter();
        refreshGameService = new RefreshGameService(gameView, fakeGameAdapter, fakeTimerAdapter);
    });

    it('should fetch the right game for the right player', () => {
        const gameId = 'gameId';
        const playerId = 'playerId';
        fakeUiAdapter.params[AppParam.GameId] = gameId;
        fakeUiAdapter.params[AppParam.PlayerId] = playerId;

        expect(fakeGameAdapter.fetchedGameId).toBeUndefined();
        expect(fakeGameAdapter.fetchedPlayerId).toBeUndefined();

        refreshGameService.execute();

        expect(fakeGameAdapter.fetchedGameId).toBe(gameId);
        expect(fakeGameAdapter.fetchedPlayerId).toBe(playerId);
    });

    it('should throw if game fetching fails', async () => {
        fakeGameAdapter.fetchError = new Error();
        await expect(refreshGameService.execute()).rejects.toThrow();
    });

    it('should display game at the beginning', async () => {
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.FirstPlace;

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after first placement', async () => {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
        ]);
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.SecondPlace;
        expectedGame.cells[0][0].currentRoundAction = CurrentRoundActionViewEnum.Place1;
        expectedGame.cells[0][0].canPlay = false;

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after second placement', async () => {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
        ]);
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.ThirdPlace;
        expectedGame.cells[0][0].currentRoundAction = CurrentRoundActionViewEnum.Place1; expectedGame.cells[0][0].canPlay = false;
        expectedGame.cells[0][1].currentRoundAction = CurrentRoundActionViewEnum.Place2; expectedGame.cells[0][1].canPlay = false;

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after third placement', async () => {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
        ]);
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.FirstPredict;
        expectedGame.cells[0][0].currentRoundAction = CurrentRoundActionViewEnum.Place1; expectedGame.cells[0][0].canPlay = false;
        expectedGame.cells[0][1].currentRoundAction = CurrentRoundActionViewEnum.Place2; expectedGame.cells[0][1].canPlay = false;
        expectedGame.cells[0][2].currentRoundAction = CurrentRoundActionViewEnum.Place3; expectedGame.cells[0][2].canPlay = false;

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after first prediction', async () => {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 0)),
        ]);
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.SecondPredict;
        expectedGame.cells[0][0].currentRoundAction = CurrentRoundActionViewEnum.Place1; expectedGame.cells[0][0].canPlay = false;
        expectedGame.cells[0][1].currentRoundAction = CurrentRoundActionViewEnum.Place2; expectedGame.cells[0][1].canPlay = false;
        expectedGame.cells[0][2].currentRoundAction = CurrentRoundActionViewEnum.Place3; expectedGame.cells[0][2].canPlay = false;
        expectedGame.cells[2][0].currentRoundAction = CurrentRoundActionViewEnum.Predict1; expectedGame.cells[2][0].canPlay = false;

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game after round complete', async () => {
        simulateFirstPlayerRound();
        const expectedGame = gameViewModelInit();
        expectedGame.status = StatusViewEnum.WaitingOpponent;
        expectedGame.cells[0][0].currentRoundAction = CurrentRoundActionViewEnum.Place1;
        expectedGame.cells[0][1].currentRoundAction = CurrentRoundActionViewEnum.Place2;
        expectedGame.cells[0][2].currentRoundAction = CurrentRoundActionViewEnum.Place3;
        expectedGame.cells[2][0].currentRoundAction = CurrentRoundActionViewEnum.Predict1;
        expectedGame.cells[3][0].currentRoundAction = CurrentRoundActionViewEnum.Predict2;
        expectedGame.cells.forEach(row => row.forEach(cell => { cell.canPlay = false; }));

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display game cells owner', async () => {
        simulateFirstPlayerRound();
        simulateFirstOpponentRound();
        const expectedGame = gameViewModelInit();
        updateFirstRound(expectedGame);

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display winning player game with toroidal territory', async () => {
        simulatePlayerWinGame();
        simulateOpponentLoseGame();
        const expectedGame = gameViewModelInit();
        updatePlayerWinGame(expectedGame);

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display losing player game with toroidal territory', async () => {
        simulatePlayerLoseGame();
        simulateOpponentWinGame();
        const expectedGame = gameViewModelInit();
        updatePlayerLoseGame(expectedGame);

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should display no winner game with toroidal territory', async () => {
        simulateNoWinnerGame();
        const expectedGame = gameViewModelInit();
        updateNoWinnerGame(expectedGame);

        expect(gameView.gameViewModel.get()).toEqual(gameViewModelInit());

        await refreshGameService.execute();

        expect(gameView.gameViewModel.get()).toEqual(expectedGame);
    });

    it('should schedule a refetch after 5000ms when status is WaitingOpponent', async () => {
        simulateFirstPlayerRound();

        expect(fakeTimerAdapter.scheduledMs).toBeUndefined();
        expect(fakeTimerAdapter.scheduledCallback).toBeUndefined();
        expect(fakeGameAdapter.fetchCallCount).toEqual(0);

        await refreshGameService.execute();

        expect(fakeTimerAdapter.scheduledMs).toBe(5000);
        expect(fakeTimerAdapter.scheduledCallback).not.toBeUndefined();
        expect(fakeGameAdapter.fetchCallCount).toEqual(1);

        await fakeTimerAdapter.trigger();

        expect(fakeGameAdapter.fetchCallCount).toEqual(2);
    });

    it('should not schedule refetch when the game is finished', async () => {
        simulatePlayerWinGame();
        simulateOpponentLoseGame();

        expect(fakeTimerAdapter.scheduledMs).toBeUndefined();
        expect(fakeTimerAdapter.scheduledCallback).toBeUndefined();

        await refreshGameService.execute();

        expect(fakeTimerAdapter.scheduledMs).toBeUndefined();
        expect(fakeTimerAdapter.scheduledCallback).toBeUndefined();
    });

    it('should not schedule refetch when player have next action', async () => {
        expect(fakeTimerAdapter.scheduledMs).toBeUndefined();
        expect(fakeTimerAdapter.scheduledCallback).toBeUndefined();

        await refreshGameService.execute();

        expect(fakeTimerAdapter.scheduledMs).toBeUndefined();
        expect(fakeTimerAdapter.scheduledCallback).toBeUndefined();
    });

    it('should throw if refetch triggered by timer fails', async () => {
        simulateFirstPlayerRound();
        await refreshGameService.execute();

        fakeGameAdapter.fetchError = new Error();
        await expect(fakeTimerAdapter.trigger()).rejects.toThrow();
    });

    function simulateFirstPlayerRound() {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(3, 0)),
        ]);
    }

    function simulateFirstOpponentRound() {
        fakeGameAdapter.addOpponentActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(1, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(2, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 3)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 2)),
        ]);
    }

    function updateFirstRound(expectedGame: GameViewModel) {
        expectedGame.status = StatusViewEnum.FirstPlace;
        expectedGame.cells[0][1].owner = OwnerViewEnum.Player; expectedGame.cells[0][1].canPlay = false;
        expectedGame.cells[0][2].owner = OwnerViewEnum.Opponent; expectedGame.cells[0][2].canPlay = false;
        expectedGame.cells[1][0].owner = OwnerViewEnum.Opponent; expectedGame.cells[1][0].canPlay = false;
        expectedGame.cells[2][0].owner = OwnerViewEnum.Player; expectedGame.cells[2][0].canPlay = false;
        expectedGame.round = '2/10';
        expectedGame.playerTerritorySize = 1;
        expectedGame.opponentTerritorySize = 1;
        expectedGame.cells[0][1].isInPlayerLargestTerritory = true;
        expectedGame.cells[0][2].isInOpponentLargestTerritory = true;
        expectedGame.history = [{
            round: 1,
            playerPlacements: 'Vous avez posé en A1, B1 et C1',
            opponentPlacements: "L'adversaire a posé en A1, A2 et A3",
            playerPredictions: 'Vous avez prédit A3 et A4',
            opponentPredictions: "L'adversaire a prédit D1 et C1",
            conflicts: ['Conflit en A1 — personne ne remporte la case'],
            playerSteals: ['Vous avez prédit A3 — vous volez la case'],
            opponentSteals: ["L'adversaire a prédit C1 — il vous vole la case"],
            playerGains: 'Vous remportez B1',
            opponentGains: "L'adversaire remporte A2",
        }];
    }

    function simulatePlayerWinGame() {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addPlayerActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
    }

    function simulateOpponentLoseGame() {
        fakeGameAdapter.addOpponentActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(1, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(2, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addOpponentActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
    }

    function updatePlayerWinGame(expectedGame: GameViewModel) {
        expectedGame.status = StatusViewEnum.Win;
        expectedGame.cells.forEach(row => row.forEach(cell => { cell.canPlay = false; }));
        expectedGame.cells[0][0].owner = OwnerViewEnum.Player;
        expectedGame.cells[0][7].owner = OwnerViewEnum.Player;
        expectedGame.cells[7][0].owner = OwnerViewEnum.Player;
        expectedGame.cells[7][7].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[1][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[2][0].owner = OwnerViewEnum.Opponent;
        expectedGame.round = '0/10';
        expectedGame.playerTerritorySize = 3;
        expectedGame.opponentTerritorySize = 2;
        expectedGame.cells[0][0].isInPlayerLargestTerritory = true;
        expectedGame.cells[0][7].isInPlayerLargestTerritory = true;
        expectedGame.cells[7][0].isInPlayerLargestTerritory = true;
        expectedGame.cells[1][0].isInOpponentLargestTerritory = true;
        expectedGame.cells[2][0].isInOpponentLargestTerritory = true;
        expectedGame.history = [
            ...Array.from({ length: 9 }, (_, i) => conflictRound(10 - i)),
            {
                round: 1,
                playerPlacements: 'Vous avez posé en A1, H1 et A8',
                opponentPlacements: "L'adversaire a posé en H8, A2 et A3",
                playerPredictions: 'Vous avez prédit B2 et C3',
                opponentPredictions: "L'adversaire a prédit B2 et C3",
                conflicts: [],
                playerSteals: [],
                opponentSteals: [],
                playerGains: 'Vous remportez A1, H1 et A8',
                opponentGains: "L'adversaire remporte H8, A2 et A3",
            },
        ];
    }

    function simulatePlayerLoseGame() {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(1, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(2, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addPlayerActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
    }

    function simulateOpponentWinGame() {
        fakeGameAdapter.addOpponentActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addOpponentActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
    }

    function updatePlayerLoseGame(expectedGame: GameViewModel) {
        expectedGame.status = StatusViewEnum.Lost;
        expectedGame.cells.forEach(row => row.forEach(cell => { cell.canPlay = false; }));
        expectedGame.cells[0][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[0][7].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[7][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[7][7].owner = OwnerViewEnum.Player;
        expectedGame.cells[1][0].owner = OwnerViewEnum.Player;
        expectedGame.cells[2][0].owner = OwnerViewEnum.Player;
        expectedGame.round = "0/10";
        expectedGame.playerTerritorySize = 2;
        expectedGame.opponentTerritorySize = 3;
        expectedGame.cells[1][0].isInPlayerLargestTerritory = true;
        expectedGame.cells[2][0].isInPlayerLargestTerritory = true;
        expectedGame.cells[0][0].isInOpponentLargestTerritory = true;
        expectedGame.cells[0][7].isInOpponentLargestTerritory = true;
        expectedGame.cells[7][0].isInOpponentLargestTerritory = true;
        expectedGame.history = [
            ...Array.from({ length: 9 }, (_, i) => conflictRound(10 - i)),
            {
                round: 1,
                playerPlacements: 'Vous avez posé en H8, A2 et A3',
                opponentPlacements: "L'adversaire a posé en A1, H1 et A8",
                playerPredictions: 'Vous avez prédit B2 et C3',
                opponentPredictions: "L'adversaire a prédit B2 et C3",
                conflicts: [],
                playerSteals: [],
                opponentSteals: [],
                playerGains: 'Vous remportez H8, A2 et A3',
                opponentGains: "L'adversaire remporte A1, H1 et A8",
            },
        ];
    }

    function simulateNoWinnerGame() {
        fakeGameAdapter.addPlayerActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(6, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 6)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addPlayerActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
        fakeGameAdapter.addOpponentActions([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 7)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(7, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
        ]);
        for (let round = 2; round <= 10; round++) {
            fakeGameAdapter.addOpponentActions([
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 3)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(1, 1)),
                new ActionDomainModel(round, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 2)),
            ]);
        }
    }

    function updateNoWinnerGame(expectedGame: GameViewModel) {
        expectedGame.status = StatusViewEnum.NoWinner;
        expectedGame.cells.forEach(row => row.forEach(cell => { cell.canPlay = false; }));
        expectedGame.cells[0][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[0][7].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[7][0].owner = OwnerViewEnum.Opponent;
        expectedGame.cells[7][7].owner = OwnerViewEnum.Player;
        expectedGame.cells[6][7].owner = OwnerViewEnum.Player;
        expectedGame.cells[7][6].owner = OwnerViewEnum.Player;
        expectedGame.round = '0/10';
        expectedGame.playerTerritorySize = 3;
        expectedGame.opponentTerritorySize = 3;
        expectedGame.cells[7][7].isInPlayerLargestTerritory = true;
        expectedGame.cells[6][7].isInPlayerLargestTerritory = true;
        expectedGame.cells[7][6].isInPlayerLargestTerritory = true;
        expectedGame.cells[0][0].isInOpponentLargestTerritory = true;
        expectedGame.cells[0][7].isInOpponentLargestTerritory = true;
        expectedGame.cells[7][0].isInOpponentLargestTerritory = true;
        expectedGame.history = [
            ...Array.from({ length: 9 }, (_, i) => conflictRound(10 - i)),
            {
                round: 1,
                playerPlacements: 'Vous avez posé en H8, H7 et G8',
                opponentPlacements: "L'adversaire a posé en A1, H1 et A8",
                playerPredictions: 'Vous avez prédit B2 et C3',
                opponentPredictions: "L'adversaire a prédit B2 et C3",
                conflicts: [],
                playerSteals: [],
                opponentSteals: [],
                playerGains: 'Vous remportez H8, H7 et G8',
                opponentGains: "L'adversaire remporte A1, H1 et A8",
            },
        ];
    }

    function conflictRound(round: number): RoundHistoryViewModel {
        return {
            round,
            playerPlacements: 'Vous avez posé en B1, C1 et D1',
            opponentPlacements: "L'adversaire a posé en B1, C1 et D1",
            playerPredictions: 'Vous avez prédit B2 et C3',
            opponentPredictions: "L'adversaire a prédit B2 et C3",
            conflicts: [
                'Conflit en B1 — personne ne remporte la case',
                'Conflit en C1 — personne ne remporte la case',
                'Conflit en D1 — personne ne remporte la case',
            ],
            playerSteals: [],
            opponentSteals: [],
            playerGains: 'Vous ne remportez aucune case',
            opponentGains: "L'adversaire ne remporte aucune case",
        };
    }

    function gameViewModelInit(): GameViewModel {
        return {
            isLoadingCreate: false,
            isLoadingFetch: false,
            isLoadingJoin: false,
            isErrorCreate: false,
            isErrorFetch: false,
            isErrorJoin: false,
            isErrorPlay: false,
            cells: Array.from({ length: 8 }, (_, x) =>
                Array.from({ length: 8 }, (_, y) => ({
                    x,
                    y,
                    owner: OwnerViewEnum.None,
                    canPlay: true,
                    currentRoundAction: CurrentRoundActionViewEnum.None,
                    isInPlayerLargestTerritory: false,
                    isInOpponentLargestTerritory: false,
                }))
            ),
            round: '1/10',
            playerTerritorySize: 0,
            opponentTerritorySize: 0,
            history: [],
        };
    }
});
