
export class NewGameDomainModel {
    constructor(
        public readonly id: string,
        public readonly playerId: string
    ) { }
}

export class GameDomainModel {
    private readonly maxRound = 10;
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

    private get round(): number {
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
        const ownedPositions = this.ownedPositions
        const largestPlayerTerritory = ownedPositions.largestPlayerTerritory
        const largestOpponentTerritory = ownedPositions.largestOpponentTerritory
        return largestPlayerTerritory.length > largestOpponentTerritory.length
    }

    isOpponentWin(): boolean {
        const ownedPositions = this.ownedPositions
        const largestPlayerTerritory = ownedPositions.largestPlayerTerritory
        const largestOpponentTerritory = ownedPositions.largestOpponentTerritory
        return largestOpponentTerritory.length > largestPlayerTerritory.length
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
        const playerPlaceRoundActions = playerRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Place));
        if (playerPlaceRoundActions.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 2);
        }
        if (playerPlaceRoundActions.length === 2) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Place, 3);
        }
        const playerPredictRoundActions = playerRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Predict));
        if (playerPredictRoundActions.length === 0) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 1);
        }
        if (playerPredictRoundActions.length === 1) {
            return new NextActionDomainModel(ActionTypeDomainEnum.Predict, 2);
        }
        return undefined;
    }

    get ownedPositions(): OwnedPositionsDomainModel {
        const ownedPositions = new OwnedPositionsDomainModel([], []);
        for (let round = 1; round <= this.maxRound; round++) {
            const playerRoundActions = this.getPlayerRoundActions(round);
            const opponentRoundActions = this.getOpponentRoundActions(round);
            if (!this.hasRoundComplete(round)) {
                return ownedPositions;
            }
            const playerPlaceRoundActions = playerRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Place));
            const playerPredictRoundActions = playerRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Predict));
            const opponentPlaceRoundActions = opponentRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Place));
            const opponentPredictRoundActions = opponentRoundActions.filter(action => action.hasType(ActionTypeDomainEnum.Predict));
            playerPlaceRoundActions.forEach(playerPlaceAction => {
                if (opponentPredictRoundActions.some(opponentPredictAction => opponentPredictAction.hasPosition(playerPlaceAction.position))) {
                    ownedPositions.addOpponentOwnedPositions(playerPlaceAction.position);
                    return;
                }
                if (!opponentPlaceRoundActions.some(opponentPlaceAction => opponentPlaceAction.hasPosition(playerPlaceAction.position))) {
                    ownedPositions.addPlayerOwnedPositions(playerPlaceAction.position);
                }
            })
            opponentPlaceRoundActions.forEach(opponentPlaceAction => {
                if (playerPredictRoundActions.some(playerPredictAction => playerPredictAction.hasPosition(opponentPlaceAction.position))) {
                    ownedPositions.addPlayerOwnedPositions(opponentPlaceAction.position);
                    return;
                }
                if (!playerPlaceRoundActions.some(playerPlaceAction => playerPlaceAction.hasPosition(opponentPlaceAction.position))) {
                    ownedPositions.addOpponentOwnedPositions(opponentPlaceAction.position);
                }
            })
        }
        return ownedPositions;
    }

    hasPlayedInCurrentRound(x: number, y: number): boolean {
        const playerRoundActions = this.getPlayerRoundActions(this.round);
        if (playerRoundActions.some(action => action.hasPosition(new PositionDomainModel(x, y)))) {
            return true
        }
        return false
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

    hasType(type: ActionTypeDomainEnum): boolean {
        return this.type === type;
    }

    hasPosition(position: PositionDomainModel): boolean {
        return this.position.hasX(position.x) && this.position.hasY(position.y);
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

    hasPlayerOwnedPosition(x: number, y: number): boolean {
        return this.playerOwnedPositions.some(position => position.hasX(x) && position.hasY(y));
    }

    hasOpponentOwnedPosition(x: number, y: number): boolean {
        return this.opponentOwnedPositions.some(position => position.hasX(x) && position.hasY(y));
    }

    addPlayerOwnedPositions(position: PositionDomainModel): void {
        this.playerOwnedPositions.push(position);
    }

    addOpponentOwnedPositions(position: PositionDomainModel): void {
        this.opponentOwnedPositions.push(position);
    }

    get largestPlayerTerritory(): PositionDomainModel[] {
        const positions = this.playerOwnedPositions;
        const visited = new Array(positions.length).fill(false);

        const isAdjacent = (a: PositionDomainModel, b: PositionDomainModel): boolean => {
            const dx = Math.min(
                Math.abs(a.x - b.x),
                this.width - Math.abs(a.x - b.x)
            );

            const dy = Math.min(
                Math.abs(a.y - b.y),
                this.height - Math.abs(a.y - b.y)
            );

            return (dx === 1 && dy === 0) || (dy === 1 && dx === 0);
        };

        const dfs = (index: number, group: PositionDomainModel[]) => {
            visited[index] = true;
            const current = positions[index];
            group.push(current);

            for (let i = 0; i < positions.length; i++) {
                if (visited[i]) continue;
                if (isAdjacent(current, positions[i])) {
                    dfs(i, group);
                }
            }
        };

        let largest: PositionDomainModel[] = [];

        for (let i = 0; i < positions.length; i++) {
            if (visited[i]) continue;

            const group: PositionDomainModel[] = [];
            dfs(i, group);

            if (group.length > largest.length) {
                largest = group;
            }
        }

        return largest;
    }

    get largestOpponentTerritory(): PositionDomainModel[] {
        const positions = this.opponentOwnedPositions;
        const visited = new Array(positions.length).fill(false);

        const isAdjacent = (a: PositionDomainModel, b: PositionDomainModel): boolean => {
            const dx = Math.min(
                Math.abs(a.x - b.x),
                this.width - Math.abs(a.x - b.x)
            );

            const dy = Math.min(
                Math.abs(a.y - b.y),
                this.height - Math.abs(a.y - b.y)
            );

            return (dx === 1 && dy === 0) || (dy === 1 && dx === 0);
        };

        const dfs = (index: number, group: PositionDomainModel[]) => {
            visited[index] = true;
            const current = positions[index];
            group.push(current);

            for (let i = 0; i < positions.length; i++) {
                if (visited[i]) continue;
                if (isAdjacent(current, positions[i])) {
                    dfs(i, group);
                }
            }
        };

        let largest: PositionDomainModel[] = [];

        for (let i = 0; i < positions.length; i++) {
            if (visited[i]) continue;

            const group: PositionDomainModel[] = [];
            dfs(i, group);

            if (group.length > largest.length) {
                largest = group;
            }
        }

        return largest;
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

export enum ActionTypeDomainEnum {
    Place = 'place',
    Predict = 'predict'
}