
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

    get nextPlayerAction(): NextActionDomainModel | undefined {
        const playerRoundActions = this.getPlayerRoundActions(this.round);
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