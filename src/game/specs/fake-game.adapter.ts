import { GamePort } from "../core/game.port";
import { GameDomainModel, NewGameDomainModel } from "../models/game.domain.model";

export class FakeGameAdapter implements GamePort {
    newGame = new NewGameDomainModel('gameId', 'playerId');
    newGameJoined = new NewGameDomainModel('gameId', 'opponentId');
    game = new GameDomainModel([], []);
    error?: unknown;
    fetchedGameId?: string;
    fetchedPlayerId?: string;
    joinedGameId?: string;
    fetchCallCount = 0;

    async createGame(): Promise<NewGameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        return this.newGame
    }

    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        this.fetchedGameId = gameId;
        this.fetchedPlayerId = playerId;
        this.fetchCallCount++;
        return this.game;
    }

    async joinGame(gameId: string): Promise<NewGameDomainModel> {
        if (this.error) {
            throw this.error;
        }
        this.joinedGameId = gameId;
        return this.newGameJoined;
    }
}