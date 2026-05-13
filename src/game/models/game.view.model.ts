export type GameViewModel = {
    isLoading: boolean;
    isError: boolean;
    board: BoardViewModel
}

export type BoardViewModel = {
    cells: CellViewModel[][];
}

export type CellViewModel = {
    x: number;
    y: number;
}