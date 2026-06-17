import { GamePort } from "../core/game.port";
import { ActionDomainModel, CellDomainModel, GameDomainModel, NewGameDomainModel } from "../models/game.domain.model";

export class FakeGameAdapter implements GamePort {
    error?: unknown;
    fetchError?: unknown;
    playError?: unknown;

    newGame = new NewGameDomainModel('gameId', 'playerId');
    async createGame(): Promise<NewGameDomainModel> {
        if (this.error) throw this.error;
        return this.newGame;
    }

    game = new GameDomainModel([], []);
    fetchedGameId?: string;
    fetchedPlayerId?: string;
    fetchCallCount = 0;
    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        if (this.fetchError) throw this.fetchError;
        this.fetchedGameId = gameId;
        this.fetchedPlayerId = playerId;
        this.fetchCallCount++;
        return this.game;
    }

    newGameJoined = new NewGameDomainModel('gameId', 'opponentId');
    joinedGameId?: string;
    async joinGame(gameId: string): Promise<NewGameDomainModel> {
        if (this.error) throw this.error;
        this.joinedGameId = gameId;
        return this.newGameJoined;
    }

    cell?: CellDomainModel;
    async playCell(cell: CellDomainModel): Promise<void> {
        if (this.playError) throw this.playError;
        this.cell = cell;
    }

    addPlayerActions(actions: ActionDomainModel[]): void {
        this.game = new GameDomainModel([...this.game.playerActions, ...actions], this.game.opponentActions);
    }

    addOpponentActions(actions: ActionDomainModel[]): void {
        this.game = new GameDomainModel(this.game.playerActions, [...this.game.opponentActions, ...actions]);
    }
}