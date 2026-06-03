import { GameDomainModel, NewGameDomainModel } from "../models/game.domain.model";

export interface GamePort {
    createGame(): Promise<NewGameDomainModel>;
    fetchGame(gameId: string, playerId: string): Promise<GameDomainModel>;
    joinGame(gameId: string): Promise<NewGameDomainModel>;
}