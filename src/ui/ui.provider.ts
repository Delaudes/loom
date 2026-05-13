import { InjectionToken } from "@angular/core";
import { AngularUiWrapper } from "./angular-ui.wrapper";
import { UiPort } from "./ui.port";

export const UI_TOKEN = new InjectionToken<UiPort>('UI_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularUiWrapper()
});
