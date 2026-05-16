
export interface UiPort {
    navigate(path: string): void;
    getParam(name: string): string
    share(text: string, path: string): void;
}

