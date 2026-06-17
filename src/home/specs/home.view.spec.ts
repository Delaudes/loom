import { AppPath } from "../../app/app.routes";
import { FakeUiAdapter } from "../../ui/fake-ui.adapter";
import { HomeView } from "../core/home.view";

describe('HomeView', () => {
    let homeView: HomeView;
    let fakeUiAdapter: FakeUiAdapter;

    beforeEach(() => {
        fakeUiAdapter = new FakeUiAdapter();
        homeView = new HomeView(fakeUiAdapter);
    });

    it('should navigate to home', () => {
        expect(fakeUiAdapter.path).toBeUndefined();
        homeView.navigateToHome();
        expect(fakeUiAdapter.path).toBe(AppPath.Home);
    });
});