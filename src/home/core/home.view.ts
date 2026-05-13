import { AppPath } from "../../app/app.routes";
import { UiPort } from "../../ui/ui.port";

export class HomeView {
    constructor(
        private readonly uiPort: UiPort
    ) { }

    navigateToHome(): void {
        this.uiPort.navigate(AppPath.Home);
    }
}