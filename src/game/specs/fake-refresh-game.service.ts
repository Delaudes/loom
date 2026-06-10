import { RefreshGamePort } from "../core/refresh-game.port";

export class FakeRefreshGameService implements RefreshGamePort {
    error?: unknown;
    executeCallCount = 0;

    async execute(): Promise<void> {
        if (this.error) throw this.error;
        this.executeCallCount++;
    }
}
