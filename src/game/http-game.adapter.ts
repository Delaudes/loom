import { HttpPort } from "../http/http.port";
import { GamePort } from "./core/game.port";
import { ActionResponse, ActionTypeApiEnum, CreateGameResponse, FetchGameResponse, JoinGameResponse, PlayRequest } from "./models/game.api.model";
import { ActionDomainModel, ActionTypeDomainEnum, CellDomainModel, GameDomainModel, NewGameDomainModel, PositionDomainModel } from "./models/game.domain.model";

export class HttpGameAdapter implements GamePort {
    private readonly baseUrl = 'https://split-api-ws8o.onrender.com';

    constructor(private readonly httpPort: HttpPort) { }

    async createGame(): Promise<NewGameDomainModel> {
        const response = await this.httpPort.post<CreateGameResponse>(`${this.baseUrl}/games`, {});
        return new NewGameDomainModel(response.id, response.playerId);
    }

    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        const response = await this.httpPort.get<FetchGameResponse>(`${this.baseUrl}/games/${gameId}/players/${playerId}`);
        return new GameDomainModel(response.playerActions.map(action => this.mapActionToDomain(action)), response.opponentActions.map(action => this.mapActionToDomain(action)));
    }

    private mapActionToDomain(action: ActionResponse): ActionDomainModel {
        return new ActionDomainModel(action.round, this.mapActionTypeToDomain(action.type), new PositionDomainModel(action.x, action.y));
    }

    private mapActionTypeToDomain(type: ActionTypeApiEnum): ActionTypeDomainEnum {
        const record: Record<ActionTypeApiEnum, ActionTypeDomainEnum> = {
            [ActionTypeApiEnum.Place]: ActionTypeDomainEnum.Place,
            [ActionTypeApiEnum.Predict]: ActionTypeDomainEnum.Predict
        };
        return record[type];
    }


    async joinGame(gameId: string): Promise<NewGameDomainModel> {
        const response = await this.httpPort.post<JoinGameResponse>(`${this.baseUrl}/games/${gameId}/join`, {});
        return new NewGameDomainModel(response.id, response.playerId);
    }

    async playCell(cell: CellDomainModel): Promise<void> {
        await this.httpPort.post<void>(`${this.baseUrl}/games/${cell.gameId}/play`, {
            playerId: cell.playerId,
            x: cell.x,
            y: cell.y,
        } satisfies PlayRequest)
    }
}