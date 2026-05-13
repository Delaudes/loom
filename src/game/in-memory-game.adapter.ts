import { GamePort } from "./core/game.port";
import { GameDomainModel } from "./models/game.domain.model";

export class InMemoryGameAdapter implements GamePort {
    constructor() { }

    async createGame(): Promise<GameDomainModel> {
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (Math.random() < 0.5) {
            throw new Error();
        }

        return new GameDomainModel("gameId", "playerId");
    }

}
