import { GamePort } from "../core/game.port";
import { GameDomainModel, NewGameDomainModel } from "../models/game.domain.model";

export class FakeGameAdapter implements GamePort {
    newGame = new NewGameDomainModel('gameId', 'playerId');
    game = new GameDomainModel([], []);
    error?: unknown;
    fetchedGameId?: string;
    fetchedPlayerId?: string;

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
        return this.game;
    }
}