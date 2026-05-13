export class FakeDialog {
    isClose = false;

    close(): void {
        this.isClose = true;
    }
}