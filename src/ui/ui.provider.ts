import { InjectionToken } from "@angular/core";
import { AngularUiAdapter } from "./angular-ui.adapter";
import { UiPort } from "./ui.port";

export const UI_TOKEN = new InjectionToken<UiPort>('UI_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularUiAdapter()
});
