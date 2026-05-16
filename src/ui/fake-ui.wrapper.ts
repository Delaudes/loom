import { UiPort } from "./ui.port";

export class FakeUiWrapper implements UiPort {
    path?: string
    params: Record<string, string> = {};
    shareText?: string;
    sharePath?: string;

    navigate(path: string): void {
        this.path = path;
    }

    getParam(name: string): string {
        return this.params[name] ?? '';
    }

    share(text: string, path: string): void {
        this.shareText = text;
        this.sharePath = path;
    }
}