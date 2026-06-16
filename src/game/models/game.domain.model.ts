
export const BOARD_SIZE = 8;

export enum ActionTypeDomainEnum {
    Place = 'place',
    Predict = 'predict'
}

export enum OwnerDomainEnum {
    Player = 'player',
    Opponent = 'opponent',
    None = 'none'
}

export class PositionDomainModel {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) { }

    isAt(x: number, y: number): boolean {
        return this.x === x && this.y === y;
    }
}

export class ActionDomainModel {
    public readonly isPlacement: boolean;
    public readonly isPrediction: boolean;

    constructor(
        public readonly round: number,
        public readonly type: ActionTypeDomainEnum,
        public readonly position: PositionDomainModel
    ) {
        this.isPlacement = type === ActionTypeDomainEnum.Place;
        this.isPrediction = type === ActionTypeDomainEnum.Predict;
    }

    isInRound(round: number): boolean {
        return this.round === round;
    }

    isAt(x: number, y: number): boolean {
        return this.position.isAt(x, y);
    }
}

export class NextActionDomainModel {
    public readonly isFirstPlaceAction: boolean;
    public readonly isSecondPlaceAction: boolean;
    public readonly isThirdPlaceAction: boolean;
    public readonly isFirstPredictAction: boolean;
    public readonly isSecondPredictAction: boolean;

    constructor(
        public readonly type: ActionTypeDomainEnum,
        public readonly number: number,
    ) {
        this.isFirstPlaceAction = type === ActionTypeDomainEnum.Place && number === 1;
        this.isSecondPlaceAction = type === ActionTypeDomainEnum.Place && number === 2;
        this.isThirdPlaceAction = type === ActionTypeDomainEnum.Place && number === 3;
        this.isFirstPredictAction = type === ActionTypeDomainEnum.Predict && number === 1;
        this.isSecondPredictAction = type === ActionTypeDomainEnum.Predict && number === 2;
    }
}

export class OwnedPositionsDomainModel {
    private readonly height = BOARD_SIZE;
    private readonly width = BOARD_SIZE;
    private readonly largestPlayerTerritory: PositionDomainModel[];
    private readonly largestOpponentTerritory: PositionDomainModel[];
    public readonly playerTerritorySize: number;
    public readonly opponentTerritorySize: number;
    public readonly isPlayerWin: boolean;
    public readonly isOpponentWin: boolean;

    constructor(
        public readonly playerOwnedPositions: PositionDomainModel[],
        public readonly opponentOwnedPositions: PositionDomainModel[]
    ) {
        this.largestPlayerTerritory = this.largestTerritory(playerOwnedPositions);
        this.largestOpponentTerritory = this.largestTerritory(opponentOwnedPositions);
        this.playerTerritorySize = this.largestPlayerTerritory.length;
        this.opponentTerritorySize = this.largestOpponentTerritory.length;
        this.isPlayerWin = this.playerTerritorySize > this.opponentTerritorySize;
        this.isOpponentWin = this.opponentTerritorySize > this.playerTerritorySize;
    }

    ownerAt(x: number, y: number): OwnerDomainEnum {
        if (this.playerOwnedPositions.some(p => p.isAt(x, y))) return OwnerDomainEnum.Player;
        if (this.opponentOwnedPositions.some(p => p.isAt(x, y))) return OwnerDomainEnum.Opponent;
        return OwnerDomainEnum.None;
    }

    isUnowned(x: number, y: number): boolean {
        return this.ownerAt(x, y) === OwnerDomainEnum.None;
    }

    isInPlayerLargestTerritory(x: number, y: number): boolean {
        return this.largestPlayerTerritory.some(p => p.isAt(x, y));
    }

    isInOpponentLargestTerritory(x: number, y: number): boolean {
        return this.largestOpponentTerritory.some(p => p.isAt(x, y));
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

export class GameDomainModel {
    public readonly maxRound = 10;
    private readonly maxActionPerRound = 5;
    public readonly round: number;
    public readonly currentRoundPlayerActions: ActionDomainModel[];
    public readonly ownedPositions: OwnedPositionsDomainModel;
    public readonly nextPlayerAction: NextActionDomainModel | undefined;
    public readonly isFinished: boolean;
    public readonly isWaitingForOpponent: boolean;
    public readonly isPlayerWin: boolean;
    public readonly isOpponentWin: boolean;

    constructor(
        public readonly playerActions: ActionDomainModel[],
        public readonly opponentActions: ActionDomainModel[]
    ) {
        this.round = this.computeRound();
        this.currentRoundPlayerActions = this.actionsInRound(this.playerActions, this.round);
        this.ownedPositions = this.computeOwnedPositions();
        this.nextPlayerAction = this.computeNextPlayerAction();
        this.isFinished = this.round === 0;
        this.isWaitingForOpponent = !this.isFinished && this.nextPlayerAction === undefined;
        this.isPlayerWin = this.ownedPositions.isPlayerWin;
        this.isOpponentWin = this.ownedPositions.isOpponentWin;
    }

    private actionsInRound(actions: ActionDomainModel[], round: number): ActionDomainModel[] {
        return actions.filter(a => a.isInRound(round));
    }

    private isRoundComplete(round: number): boolean {
        return this.actionsInRound(this.playerActions, round).length >= this.maxActionPerRound
            && this.actionsInRound(this.opponentActions, round).length >= this.maxActionPerRound;
    }

    private computeRound(): number {
        for (let round = 1; round <= this.maxRound; round++) {
            if (!this.isRoundComplete(round)) {
                return round;
            }
        }
        return 0;
    }

    private computeOwnedPositions(): OwnedPositionsDomainModel {
        const playerOwned: PositionDomainModel[] = [];
        const opponentOwned: PositionDomainModel[] = [];
        for (let round = 1; round <= this.maxRound; round++) {
            if (!this.isRoundComplete(round)) {
                break;
            }
            const playerPlacements = this.actionsInRound(this.playerActions, round).filter(a => a.isPlacement);
            const playerPredictions = this.actionsInRound(this.playerActions, round).filter(a => a.isPrediction);
            const opponentPlacements = this.actionsInRound(this.opponentActions, round).filter(a => a.isPlacement);
            const opponentPredictions = this.actionsInRound(this.opponentActions, round).filter(a => a.isPrediction);
            playerPlacements.forEach(placement => {
                if (opponentPredictions.some(p => p.isAt(placement.position.x, placement.position.y))) {
                    opponentOwned.push(placement.position);
                } else if (!opponentPlacements.some(p => p.isAt(placement.position.x, placement.position.y))) {
                    playerOwned.push(placement.position);
                }
            });
            opponentPlacements.forEach(placement => {
                if (playerPredictions.some(p => p.isAt(placement.position.x, placement.position.y))) {
                    playerOwned.push(placement.position);
                } else if (!playerPlacements.some(p => p.isAt(placement.position.x, placement.position.y))) {
                    opponentOwned.push(placement.position);
                }
            });
        }
        return new OwnedPositionsDomainModel(playerOwned, opponentOwned);
    }

    private computeNextPlayerAction(): NextActionDomainModel | undefined {
        if (this.round === 0) {
            return undefined;
        }
        const actions = this.currentRoundPlayerActions;
        if (actions.length === 0) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 1);
        }
        const placements = actions.filter(a => a.isPlacement);
        if (placements.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 2);
        }
        if (placements.length === 2) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 3);
        }
        const predictions = actions.filter(a => a.isPrediction);
        if (predictions.length === 0) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 1);
        }
        if (predictions.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 2);
        }
        return undefined;
    }

    hasPlayedInCurrentRound(x: number, y: number): boolean {
        return this.currentRoundPlayerActions.some(a => a.isAt(x, y));
    }

    canPlayAt(x: number, y: number): boolean {
        if (!this.nextPlayerAction) return false;
        return this.ownedPositions.isUnowned(x, y) && !this.hasPlayedInCurrentRound(x, y);
    }
}

export class NewGameDomainModel {
    constructor(
        public readonly id: string,
        public readonly playerId: string
    ) { }
}
