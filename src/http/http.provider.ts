import { InjectionToken } from "@angular/core";
import { AngularHttpWrapper } from "./angular-http.wrapper";
import { HttpPort } from "./http.port";

export const HTTP_TOKEN = new InjectionToken<HttpPort>('HTTP_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularHttpWrapper()
});