import { Routes } from '@angular/router';
import { GameComponent } from '../game/components/game.component';
import { HomeComponent } from '../home/home.component';

export enum AppPath {
    Home = '',
    Games = 'games',
    Players = 'players',
}

export enum AppParam {
    GameId = 'gameId',
    PlayerId = 'playerId',
}

export const routes: Routes = [
    {
        path: AppPath.Home,
        component: HomeComponent,
    },
    {
        path: AppPath.Games + '/:' + AppParam.GameId,
        component: GameComponent,
    },
    {
        path: AppPath.Games + '/:' + AppParam.GameId + '/' + AppPath.Players + '/:' + AppParam.PlayerId,
        component: GameComponent,
    },
    {
        path: '**',
        redirectTo: AppPath.Home,
    }
];
