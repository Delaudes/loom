import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { GAME_PROVIDERS } from '../game/game.provider';
import { HOME_PROVIDERS } from '../home/home.provider';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    HOME_PROVIDERS,
    GAME_PROVIDERS,
  ]
};
