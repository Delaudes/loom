import { inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UiPort } from "./ui.port";

export class AngularUiWrapper implements UiPort {
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);

    navigate(path: string): void {
        this.router.navigate([path]);
    }

    getParam(name: string): string {
        return this.activatedRoute.firstChild?.snapshot.paramMap.get(name) ?? '';
    }

    share(text: string, path: string): void {
        navigator.share({
            text,
            url: location.origin + '/' + path,
        });
    }
}