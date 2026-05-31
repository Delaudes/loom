export type GameViewModel = {
    isLoadingCreate: boolean;
    isLoadingFetch: boolean;
    isErrorCreate: boolean;
    isErrorFetch: boolean;
    status?: StatusViewEnum;
    cells: CellViewModel[][];
    round: string;
}

export type CellViewModel = {
    x: number;
    y: number;
    owner: OwnerViewEnum;
    canPlay: boolean;
}

export enum StatusViewEnum {
    WaitingOpponent = "En attente de l'adversaire",
    FirstPlace = "Posez votre 1er pion",
    SecondPlace = "Posez votre 2ème pion",
    ThirdPlace = "Posez votre 3ème pion",
    FirstPredict = "Prédisez la 1ère position adverse",
    SecondPredict = "Prédisez la 2ème position adverse",
    Win = "Victoire",
    Lost = "Défaite",
    NoWinner = "Égalité"
}

export enum OwnerViewEnum {
    Player = "player",
    Opponent = "opponent",
    None = "none"
}