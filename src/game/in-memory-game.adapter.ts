import { GamePort } from "./core/game.port";
import { GameDomainModel, NewGameDomainModel } from "./models/game.domain.model";

export class InMemoryGameAdapter implements GamePort {
    constructor() { }

    async createGame(): Promise<NewGameDomainModel> {
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (Math.random() < 0.5) {
            throw new Error();
        }

        return new NewGameDomainModel("gameId", "playerId");
    }

    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (gameId === "error") {
            throw new Error();
        }

        return new GameDomainModel([], []);
    }
}
