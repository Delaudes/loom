import { AppPath } from "../../app/app.routes";
import { FakeUiWrapper } from "../../ui/fake-ui.wrapper";
import { HomeView } from "../core/home.view";

describe('HomeView', () => {
    let homeView: HomeView;
    let fakeUiWrapper: FakeUiWrapper;

    beforeEach(() => {
        fakeUiWrapper = new FakeUiWrapper();
        homeView = new HomeView(fakeUiWrapper);
    });

    it('should navigate to home', () => {
        expect(fakeUiWrapper.path).toBeUndefined();
        homeView.navigateToHome();
        expect(fakeUiWrapper.path).toBe(AppPath.Home);
    });
});