import { GameDomainModel } from "../models/game.domain.model";

export interface GamePort {
    createGame(): Promise<GameDomainModel>;
}