import { AppParam, AppPath } from "../../app/app.routes";
import { FakeSignalWrapper } from "../../signal/fake-signal.wrapper";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { GameView } from "../core/game.view";
import { GameViewModel } from "../models/game.view.model";

describe('GameView', () => {
    let gameView: GameView;
    let fakeUiWrapper: FakeUiWrapper;

    beforeEach(() => {
        fakeUiWrapper = new FakeUiWrapper();
        gameView = new GameView(new FakeSignalWrapper<GameViewModel>(), fakeUiWrapper);
    });

    it('should share game', () => {
        const gameId = 'gameId';
        fakeUiWrapper.params[AppParam.GameId] = gameId;

        expect(fakeUiWrapper.shareText).toBeUndefined();
        expect(fakeUiWrapper.sharePath).toBeUndefined();

        gameView.shareGame();

        expect(fakeUiWrapper.shareText).toEqual(`Viens me défier sur LOOM !\n`);
        expect(fakeUiWrapper.sharePath).toEqual(AppPath.Games + '/' + gameId);
    });
});