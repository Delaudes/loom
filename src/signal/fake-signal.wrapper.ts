import { SignalPort } from "./signal.port";

export class FakeSignalWrapper<T> implements SignalPort<T> {
    private signal = undefined as T;

    get(): T {
        return this.signal;
    }

    set(signal: T): void {
        this.signal = signal;
    }

    update(updater: (signal: T) => T): void {
        this.signal = updater(this.signal);
    }
}