import { TimerPort } from "./timer.port";

export class AngularTimerAdapter implements TimerPort {
    private currentTimeout?: ReturnType<typeof setTimeout>;

    scheduleOnce(callback: () => void, ms: number): void {
        this.currentTimeout = setTimeout(callback, ms);
    }

    cancel(): void {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = undefined;
    }
}
