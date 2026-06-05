import { TimerPort } from "./timer.port";

export class FakeTimerWrapper implements TimerPort {
    scheduledCallback?: (() => void);
    scheduledMs?: number;

    scheduleOnce(callback: () => void, ms: number): void {
        this.scheduledCallback = callback;
        this.scheduledMs = ms;
    }

    cancel(): void {
        this.scheduledCallback = undefined;
        this.scheduledMs = undefined;
    }

    async trigger(): Promise<void> {
        await this.scheduledCallback?.();
    }
}
