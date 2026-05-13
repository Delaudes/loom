import { UiPort } from "./ui.port";

export class FakeUiWrapper implements UiPort {
    path?: string
    params: Record<string, string> = {};
    shareText?: string;
    shareUrl?: string;

    navigate(path: string): void {
        this.path = path;
    }

    getParam(name: string): string {
        return this.params[name] ?? '';
    }

    share(text: string, url: string): void {
        this.shareText = text;
        this.shareUrl = url;
    }
}