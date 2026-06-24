import { FakeHttpAdapter } from "../../http/fake-http.adapter";
import { HttpGameAdapter } from "../http-game.adapter";
import { ActionTypeApiEnum, FetchGameResponse } from "../models/game.api.model";
import { ActionTypeDomainEnum, CellDomainModel, NewGameDomainModel } from "../models/game.domain.model";

describe('HttpGameAdapter', () => {
    let adapter: HttpGameAdapter;
    let fakeHttp: FakeHttpAdapter;
    const BASE_URL = 'https://split-api-ws8o.onrender.com';

    beforeEach(() => {
        fakeHttp = new FakeHttpAdapter();
        adapter = new HttpGameAdapter(fakeHttp);
    });

    it('should post to /games and map response to new game', async () => {
        const newGameResponse: NewGameDomainModel = { id: 'game-1', playerId: 'player-1' };
        fakeHttp.postResponse = newGameResponse;

        expect(fakeHttp.lastPostUrl).toBeUndefined();

        const response = await adapter.createGame();

        expect(fakeHttp.lastPostUrl).toBe(`${BASE_URL}/games`);
        expect(fakeHttp.lastPostBody).toEqual({});
        expect(response.id).toBe(newGameResponse.id);
        expect(response.playerId).toBe(newGameResponse.playerId);
    });

    it('should post to /games/{id}/join and map response to new game', async () => {
        const newGameResponse: NewGameDomainModel = { id: 'game-1', playerId: 'player-2' };
        fakeHttp.postResponse = newGameResponse;

        expect(fakeHttp.lastPostUrl).toBeUndefined();

        const response = await adapter.joinGame('game-1');

        expect(fakeHttp.lastPostUrl).toBe(`${BASE_URL}/games/game-1/join`);
        expect(fakeHttp.lastPostBody).toEqual({});
        expect(response.id).toBe(newGameResponse.id);
        expect(response.playerId).toBe(newGameResponse.playerId);
    });

    it('should get /games/{id}/players/{playerId}', async () => {
        const fetchGameResponse: FetchGameResponse = { playerActions: [], opponentActions: [] };
        fakeHttp.getResponse = fetchGameResponse;

        expect(fakeHttp.lastGetUrl).toBeUndefined();

        await adapter.fetchGame('game-1', 'player-1');

        expect(fakeHttp.lastGetUrl).toBe(`${BASE_URL}/games/game-1/players/player-1`);
    });

    it('should map player and opponent actions to domain', async () => {
        const fetchGameResponse: FetchGameResponse = {
            playerActions: [
                { round: 2, type: ActionTypeApiEnum.Place, x: 3, y: 5 },
                { round: 2, type: ActionTypeApiEnum.Predict, x: 1, y: 4 },
            ],
            opponentActions: [
                { round: 2, type: ActionTypeApiEnum.Place, x: 0, y: 7 },
            ],
        };
        fakeHttp.getResponse = fetchGameResponse;

        const response = await adapter.fetchGame('game-1', 'player-1');

        expect(response.playerActions).toHaveLength(2);
        expect(response.playerActions[0].round).toBe(fetchGameResponse.playerActions[0].round);
        expect(response.playerActions[0].type).toBe(ActionTypeDomainEnum.Place);
        expect(response.playerActions[0].position.x).toBe(fetchGameResponse.playerActions[0].x);
        expect(response.playerActions[0].position.y).toBe(fetchGameResponse.playerActions[0].y);
        expect(response.playerActions[1].type).toBe(ActionTypeDomainEnum.Predict);
        expect(response.opponentActions).toHaveLength(1);
        expect(response.opponentActions[0].position.x).toBe(fetchGameResponse.opponentActions[0].x);
        expect(response.opponentActions[0].position.y).toBe(fetchGameResponse.opponentActions[0].y);
    });

    it('should post to /games/{id}/play with cell data', async () => {
        const cell = new CellDomainModel(3, 5, 'game-1', 'player-1');

        expect(fakeHttp.lastPostUrl).toBeUndefined();

        await adapter.playCell(cell);

        expect(fakeHttp.lastPostUrl).toBe(`${BASE_URL}/games/${cell.gameId}/play`);
        expect(fakeHttp.lastPostBody).toEqual({ playerId: cell.playerId, x: cell.x, y: cell.y });
    });
});
