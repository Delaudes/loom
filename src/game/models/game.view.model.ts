export type GameViewModel = {
    isLoadingCreate: boolean;
    isLoadingFetch: boolean;
    isErrorCreate: boolean;
    isErrorFetch: boolean;
    status?: StatusViewEnum;
    cells: CellViewModel[][];
}



export type CellViewModel = {
    x: number;
    y: number;
    owner: OwnerViewEnum;
    canPlay: boolean;
}

export enum StatusViewEnum {
    WaitingOpponent = "En attente de l'adversaire",
    FirstPlace = "Placement n°1",
    SecondPlace = "Placement n°2",
    ThirdPlace = "Placement n°3",
    FirstPredict = "Prédiction n°1",
    SecondPredict = "Prédiction n°2",
    Lost = "Partie perdue",
    Win = "Partie gagnée",
    NoWinner = "Aucun vainqueur : égalité"
}

export enum OwnerViewEnum {
    Player = "player",
    Opponent = "opponent",
    None = "none"
}