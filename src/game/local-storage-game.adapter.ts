import { GamePort } from "./core/game.port";
import { ActionDomainModel, ActionTypeDomainEnum, CellDomainModel, GameDomainModel, NewGameDomainModel, PositionDomainModel } from "./models/game.domain.model";

interface StoredAction {
    playerId: string;
    round: number;
    type: ActionTypeDomainEnum;
    x: number;
    y: number;
}

interface StoredGame {
    player1Id: string;
    player2Id: string | null;
    actions: StoredAction[];
}

export class LocalStorageGameAdapter implements GamePort {
    private readonly prefix = 'loom_game_';

    private key(gameId: string): string {
        return `${this.prefix}${gameId}`;
    }

    private read(gameId: string): StoredGame {
        const raw = localStorage.getItem(this.key(gameId));
        if (!raw) throw new Error(`Game ${gameId} not found`);
        return JSON.parse(raw) as StoredGame;
    }

    private write(gameId: string, game: StoredGame): void {
        localStorage.setItem(this.key(gameId), JSON.stringify(game));
    }

    async createGame(): Promise<NewGameDomainModel> {
        const gameId = crypto.randomUUID();
        const player1Id = crypto.randomUUID();
        this.write(gameId, { player1Id, player2Id: null, actions: [] });
        return new NewGameDomainModel(gameId, player1Id);
    }

    async fetchGame(gameId: string, playerId: string): Promise<GameDomainModel> {
        const stored = this.read(gameId);
        const opponentId = stored.player1Id === playerId ? stored.player2Id : stored.player1Id;

        const playerActions = stored.actions
            .filter(a => a.playerId === playerId)
            .map(a => new ActionDomainModel(a.round, a.type, new PositionDomainModel(a.x, a.y)));

        const opponentActions = opponentId
            ? stored.actions
                .filter(a => a.playerId === opponentId)
                .map(a => new ActionDomainModel(a.round, a.type, new PositionDomainModel(a.x, a.y)))
            : [];

        return new GameDomainModel(playerActions, opponentActions);
    }

    async joinGame(gameId: string): Promise<NewGameDomainModel> {
        const stored = this.read(gameId);
        if (stored.player2Id !== null) throw new Error(`Game ${gameId} is already full`);
        const player2Id = crypto.randomUUID();
        this.write(gameId, { ...stored, player2Id });
        return new NewGameDomainModel(gameId, player2Id);
    }

    async playCell(cell: CellDomainModel): Promise<void> {
        const stored = this.read(cell.gameId);
        const game = await this.fetchGame(cell.gameId, cell.playerId);
        const nextAction = game.nextPlayerAction;
        if (!nextAction) throw new Error('No action available for this player');
        stored.actions.push({
            playerId: cell.playerId,
            round: game.round,
            type: nextAction.type,
            x: cell.x,
            y: cell.y,
        });
        this.write(cell.gameId, stored);
    }
}
