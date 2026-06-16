export type GameViewModel = {
    isLoadingCreate: boolean;
    isLoadingFetch: boolean;
    isLoadingJoin: boolean;
    isErrorCreate: boolean;
    isErrorFetch: boolean;
    isErrorJoin: boolean;
    isErrorPlay: boolean;
    status?: StatusViewEnum;
    cells: CellViewModel[][];
    round: string;
    playerTerritorySize: number;
    opponentTerritorySize: number;
}

export type CellViewModel = {
    x: number;
    y: number;
    owner: OwnerViewEnum;
    canPlay: boolean;
    currentRoundAction: CurrentRoundActionViewEnum;
    isInPlayerLargestTerritory: boolean;
    isInOpponentLargestTerritory: boolean;
}

export enum StatusViewEnum {
    WaitingOpponent = "En attente de l'adversaire...",
    FirstPlace = "Posez votre 1er pion",
    SecondPlace = "Posez votre 2ème pion",
    ThirdPlace = "Posez votre 3ème pion",
    FirstPredict = "Faites votre 1ère prédiction",
    SecondPredict = "Faites votre 2ème prédiction",
    Win = "Victoire",
    Lost = "Défaite",
    NoWinner = "Égalité"
}

export enum CurrentRoundActionViewEnum {
    None = 'none',
    Place1 = 'place1',
    Place2 = 'place2',
    Place3 = 'place3',
    Predict1 = 'predict1',
    Predict2 = 'predict2',
}

export enum OwnerViewEnum {
    Player = "player",
    Opponent = "opponent",
    None = "none"
}