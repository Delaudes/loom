import { InjectionToken } from "@angular/core";
import { AngularHttpAdapter } from "./angular-http.adapter";
import { HttpPort } from "./http.port";

export const HTTP_TOKEN = new InjectionToken<HttpPort>('HTTP_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularHttpAdapter()
});