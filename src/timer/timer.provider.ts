import { InjectionToken } from "@angular/core";
import { AngularTimerWrapper } from "./angular-timer.wrapper";
import { TimerPort } from "./timer.port";

export const TIMER_TOKEN = new InjectionToken<TimerPort>('TIMER_TOKEN', {
    providedIn: 'root',
    factory: () => new AngularTimerWrapper()
});
