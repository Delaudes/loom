import { TimerPort } from "./timer.port";

export class AngularTimerWrapper implements TimerPort {
    scheduleOnce(callback: () => void, ms: number): void {
        setTimeout(callback, ms);
    }
}
