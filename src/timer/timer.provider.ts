import { InjectionToken } from "@angular/core";
import { AngularTimerAdapter } from "./angular-timer.adapter";
import { TimerPort } from "./timer.port";

export const TIMER_TOKEN = new InjectionToken<TimerPort>('TIMER_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularTimerAdapter()
});
