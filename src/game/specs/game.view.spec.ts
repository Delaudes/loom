import { AppParam, AppPath } from "../../app/app.routes";
import { FakeSignalAdapter } from "../../signal/fake-signal.adapter";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { GameView } from "../core/game.view";
import { GameViewModel } from "../models/game.view.model";

describe('GameView', () => {
    let gameView: GameView;
    let fakeUiAdapter: FakeUiAdapter;

    beforeEach(() => {
        fakeUiAdapter = new FakeUiAdapter();
        gameView = new GameView(new FakeSignalAdapter<GameViewModel>(), fakeUiAdapter);
    });

    it('should share game', () => {
        const gameId = 'gameId';
        fakeUiAdapter.params[AppParam.GameId] = gameId;

        expect(fakeUiAdapter.shareText).toBeUndefined();
        expect(fakeUiAdapter.sharePath).toBeUndefined();

        gameView.shareGame();

        expect(fakeUiAdapter.shareText).toEqual(`Viens me défier sur LOOM !\n`);
        expect(fakeUiAdapter.sharePath).toEqual(AppPath.Games + '/' + gameId);
    });
});