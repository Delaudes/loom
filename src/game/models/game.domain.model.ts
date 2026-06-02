
export class NewGameDomainModel {
    constructor(
        public readonly id: string,
        public readonly playerId: string
    ) { }
}

export class GameDomainModel {
    public readonly maxRound = 10;
    private readonly maxActionPerRound = 5;
    constructor(
        public readonly playerActions: ActionDomainModel[],
        public readonly opponentActions: ActionDomainModel[]
    ) { }

    private getPlayerRoundActions(round: number): ActionDomainModel[] {
        return this.playerActions.filter(action => action.hasRound(round));
    }

    private getOpponentRoundActions(round: number): ActionDomainModel[] {
        return this.opponentActions.filter(action => action.hasRound(round));
    }

    private hasPlayerRoundComplete(round: number): boolean {
        return this.getPlayerRoundActions(round).length >= this.maxActionPerRound;
    }

    private hasOpponentRoundComplete(round: number): boolean {
        return this.getOpponentRoundActions(round).length >= this.maxActionPerRound;
    }

    private hasRoundComplete(round: number): boolean {
        return this.hasPlayerRoundComplete(round) && this.hasOpponentRoundComplete(round);
    }

    get round(): number {
        for (let round = 1; round <= this.maxRound; round++) {
            if (!this.hasRoundComplete(round)) {
                return round;
            }
        }
        return 0;
    }

    isFinished(): boolean {
        return this.round === 0
    }

    isPlayerWin(): boolean {
        return this.ownedPositions.isPlayerWin();
    }

    isOpponentWin(): boolean {
        return this.ownedPositions.isOpponentWin();
    }

    get nextPlayerAction(): NextActionDomainModel | undefined {
        const round = this.round
        if (round === 0) {
            return undefined
        }
        const playerRoundActions = this.getPlayerRoundActions(round);
        if (playerRoundActions.length === 0) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 1);
        }
        const playerPlacements = playerRoundActions.filter(a => a.isPlacement());
        if (playerPlacements.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 2);
        }
        if (playerPlacements.length === 2) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 3);
        }
        const playerPredictions = playerRoundActions.filter(a => a.isPrediction());
        if (playerPredictions.length === 0) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 1);
        }
        if (playerPredictions.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 2);
        }
        return undefined;
    }

    get ownedPositions(): OwnedPositionsDomainModel {
        const ownedPositions = new OwnedPositionsDomainModel([], []);
        for (let round = 1; round <= this.maxRound; round++) {
            if (!this.hasRoundComplete(round)) {
                return ownedPositions;
            }
            const playerRoundActions = this.getPlayerRoundActions(round);
            const opponentRoundActions = this.getOpponentRoundActions(round);
            const playerPlacements = playerRoundActions.filter(a => a.isPlacement());
            const playerPredictions = playerRoundActions.filter(a => a.isPrediction());
            const opponentPlacements = opponentRoundActions.filter(a => a.isPlacement());
            const opponentPredictions = opponentRoundActions.filter(a => a.isPrediction());
            playerPlacements.forEach(placement => {
                if (opponentPredictions.some(p => p.hasPosition(placement.position))) {
                    ownedPositions.addOpponentOwnedPositions(placement.position);
                } else if (!opponentPlacements.some(p => p.hasPosition(placement.position))) {
                    ownedPositions.addPlayerOwnedPositions(placement.position);
                }
            });
            opponentPlacements.forEach(placement => {
                if (playerPredictions.some(p => p.hasPosition(placement.position))) {
                    ownedPositions.addPlayerOwnedPositions(placement.position);
                } else if (!playerPlacements.some(p => p.hasPosition(placement.position))) {
                    ownedPositions.addOpponentOwnedPositions(placement.position);
                }
            });
        }
        return ownedPositions;
    }

    hasPlayedInCurrentRound(x: number, y: number): boolean {
        return this.getPlayerRoundActions(this.round).some(action => action.isAt(x, y));
    }

    canPlayAt(x: number, y: number): boolean {
        if (this.isFinished()) return false;
        return this.ownedPositions.isUnowned(x, y) && !this.hasPlayedInCurrentRound(x, y);
    }
}

export class ActionDomainModel {
    constructor(
        public readonly round: number,
        public readonly type: ActionTypeDomainEnum,
        public readonly position: PositionDomainModel
    ) { }

    hasRound(round: number): boolean {
        return this.round === round;
    }

    isPlacement(): boolean {
        return this.type === ActionTypeDomainEnum.Place;
    }

    isPrediction(): boolean {
        return this.type === ActionTypeDomainEnum.Predict;
    }

    hasPosition(position: PositionDomainModel): boolean {
        return this.position.hasX(position.x) && this.position.hasY(position.y);
    }

    isAt(x: number, y: number): boolean {
        return this.position.hasX(x) && this.position.hasY(y);
    }
}

export class NextActionDomainModel {
    constructor(
        public readonly type: ActionTypeDomainEnum,
        public readonly number: number,
    ) { }

    private hasType(type: ActionTypeDomainEnum): boolean {
        return this.type === type;
    }

    private hasNumber(number: number): boolean {
        return this.number === number;
    }

    isFirstPlaceAction(): boolean {
        return this.hasType(ActionTypeDomainEnum.Place) && this.hasNumber(1)
    }

    isSecondPlaceAction(): boolean {
        return this.hasType(ActionTypeDomainEnum.Place) && this.hasNumber(2)
    }

    isThirdPlaceAction(): boolean {
        return this.hasType(ActionTypeDomainEnum.Place) && this.hasNumber(3)
    }

    isFirstPredictAction(): boolean {
        return this.hasType(ActionTypeDomainEnum.Predict) && this.hasNumber(1)
    }

    isSecondPredictAction(): boolean {
        return this.hasType(ActionTypeDomainEnum.Predict) && this.hasNumber(2)
    }
}

export class OwnedPositionsDomainModel {
    private readonly height = 8
    private readonly width = 8
    constructor(
        public readonly playerOwnedPositions: PositionDomainModel[],
        public readonly opponentOwnedPositions: PositionDomainModel[]
    ) { }

    isPlayerWin(): boolean {
        return this.largestPlayerTerritory.length > this.largestOpponentTerritory.length;
    }

    isOpponentWin(): boolean {
        return this.largestOpponentTerritory.length > this.largestPlayerTerritory.length;
    }

    ownerAt(x: number, y: number): OwnerDomainEnum {
        if (this.playerOwnedPositions.some(p => p.hasX(x) && p.hasY(y))) return OwnerDomainEnum.Player;
        if (this.opponentOwnedPositions.some(p => p.hasX(x) && p.hasY(y))) return OwnerDomainEnum.Opponent;
        return OwnerDomainEnum.None;
    }

    isUnowned(x: number, y: number): boolean {
        return !this.playerOwnedPositions.some(p => p.hasX(x) && p.hasY(y))
            && !this.opponentOwnedPositions.some(p => p.hasX(x) && p.hasY(y));
    }

    addPlayerOwnedPositions(position: PositionDomainModel): void {
        this.playerOwnedPositions.push(position);
    }

    addOpponentOwnedPositions(position: PositionDomainModel): void {
        this.opponentOwnedPositions.push(position);
    }

    get largestPlayerTerritory(): PositionDomainModel[] {
        return this.largestTerritory(this.playerOwnedPositions);
    }

    get largestOpponentTerritory(): PositionDomainModel[] {
        return this.largestTerritory(this.opponentOwnedPositions);
    }

    private largestTerritory(positions: PositionDomainModel[]): PositionDomainModel[] {
        const visited = new Array(positions.length).fill(false);

        const collect = (index: number, territory: PositionDomainModel[]) => {
            visited[index] = true;
            const current = positions[index];
            territory.push(current);
            for (let i = 0; i < positions.length; i++) {
                if (!visited[i] && this.isAdjacent(current, positions[i])) {
                    collect(i, territory);
                }
            }
        };

        let largest: PositionDomainModel[] = [];
        for (let i = 0; i < positions.length; i++) {
            if (visited[i]) continue;
            const territory: PositionDomainModel[] = [];
            collect(i, territory);
            if (territory.length > largest.length) {
                largest = territory;
            }
        }
        return largest;
    }

    private isAdjacent(a: PositionDomainModel, b: PositionDomainModel): boolean {
        const dx = Math.min(Math.abs(a.x - b.x), this.width - Math.abs(a.x - b.x));
        const dy = Math.min(Math.abs(a.y - b.y), this.height - Math.abs(a.y - b.y));
        return (dx === 1 && dy === 0) || (dy === 1 && dx === 0);
    }
}

export class PositionDomainModel {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) { }

    hasX(x: number): boolean {
        return this.x === x;
    }

    hasY(y: number): boolean {
        return this.y === y;
    }
}

export enum OwnerDomainEnum {
    Player = 'player',
    Opponent = 'opponent',
    None = 'none'
}

export enum ActionTypeDomainEnum {
    Place = 'place',
    Predict = 'predict'
}