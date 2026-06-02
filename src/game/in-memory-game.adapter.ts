import { GamePort } from "./core/game.port";
import { ActionDomainModel, ActionTypeDomainEnum, GameDomainModel, NewGameDomainModel, PositionDomainModel } from "./models/game.domain.model";

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

        return new GameDomainModel([
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 1)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 2)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(2, 0)),
            new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(3, 0))
        ], [new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(0, 0)),
        new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(1, 0)),
        new ActionDomainModel(1, ActionTypeDomainEnum.Place, new PositionDomainModel(2, 0)),
        new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 2)),
        new ActionDomainModel(1, ActionTypeDomainEnum.Predict, new PositionDomainModel(0, 3))]);
    }
}
