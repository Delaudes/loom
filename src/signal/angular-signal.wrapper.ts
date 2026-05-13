import { signal } from "@angular/core";
import { SignalPort } from "./signal.port";

export class AngularSignalWrapper<T> implements SignalPort<T> {
    private readonly signal = signal<T>(undefined as T)

    get(): T {
        return this.signal();
    }

    set(value: T): void {
        this.signal.set(value);
    }

    update(updater: (currentValue: T) => T): void {
        this.signal.update(updater);
    }
}