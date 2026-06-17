import { TimerPort } from "./timer.port";

export class FakeTimerAdapter implements TimerPort {
    scheduledCallback?: (() => void);
    scheduledMs?: number;

    scheduleOnce(callback: () => void, ms: number): void {
        this.scheduledCallback = callback;
        this.scheduledMs = ms;
    }

    cancelCallCount = 0;

    cancel(): void {
        this.cancelCallCount++;
        this.scheduledCallback = undefined;
        this.scheduledMs = undefined;
    }

    async trigger(): Promise<void> {
        await this.scheduledCallback?.();
    }
}
