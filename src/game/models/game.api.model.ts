
export type CreateGameResponse = {
    id: string;
    playerId: string;
};

export type JoinGameResponse = {
    id: string;
    playerId: string;
};

export type FetchGameResponse = {
    playerActions: ActionResponse[];
    opponentActions: ActionResponse[];
};

export type ActionResponse = {
    round: number;
    type: ActionTypeApiEnum;
    x: number;
    y: number;
}

export enum ActionTypeApiEnum {
    Place = 'PLACE',
    Predict = 'PREDICT'
}

export type PlayRequest = {
    playerId: string;
    x: number;
    y: number;
}