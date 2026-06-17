import { Dialog } from "./dialog.port";

export class FakeDialog implements Dialog {
    isClose = false;

    close(): void {
        this.isClose = true;
    }
}
