import { GamePort } from "../core/game.port";
import { CellApiModel } from "../models/game.api.model";
import { GameDomainModel, NewGameDomainModel } from "../models/game.domain.model";

export class FakeGameAdapter implements GamePort {
    error?: unknown;

    newGame = new NewGameDomainModel('gameId', 'playerId');
    async createGame(): Promise<NewGameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        return this.newGame
    }

    game = new GameDomainModel([], []);
    fetchedGameId?: string;
    fetchedPlayerId?: string;
    fetchCallCount = 0;
    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        this.fetchedGameId = gameId;
        this.fetchedPlayerId = playerId;
        this.fetchCallCount++;
        return this.game;
    }


    newGameJoined = new NewGameDomainModel('gameId', 'opponentId');
    joinedGameId?: string;
    async joinGame(gameId: string): Promise<NewGameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        this.joinedGameId = gameId;
        return this.newGameJoined;
    }

    cell?: CellApiModel;
    async playCell(cell: CellApiModel): Promise<void> {
        if (this.error) {
            throw this.error;
        }

        this.cell = cell;
    }
}