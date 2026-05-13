export interface SignalPort<T> {
    get(): T
    set(signal: T): void
    update(updater: (signal: T) => T): void
}
