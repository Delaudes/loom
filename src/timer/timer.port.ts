export interface TimerPort {
    scheduleOnce(callback: () => void, ms: number): void;
    cancel(): void;
}
