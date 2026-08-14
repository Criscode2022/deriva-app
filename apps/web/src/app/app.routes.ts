import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  {
    path: 'walks/:slug',
    loadComponent: () =>
      import('./pages/walk/walk.page').then((m) => m.WalkPage),
  },
  {
    path: 'walks/:slug/pedir',
    loadComponent: () =>
      import('./pages/request/request.page').then((m) => m.RequestPage),
  },
  {
    path: 'ok/:code',
    loadComponent: () => import('./pages/ok/ok.page').then((m) => m.OkPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'inbox',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/inbox/inbox.page').then((m) => m.InboxPage),
  },
  { path: '**', redirectTo: '' },
];
