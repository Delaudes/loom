import { UI_TOKEN } from "../ui/ui.provider";
import { HomeView } from "./core/home.view";

export const HOME_PROVIDERS = [
    {
        provide: HomeView,
        deps: [UI_TOKEN],
    }
];