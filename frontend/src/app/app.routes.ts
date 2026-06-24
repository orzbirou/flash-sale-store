import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'store',
    loadComponent: () =>
      import('./features/store/store-shell.component').then((m) => m.StoreShellComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: '**', redirectTo: 'store' },
];
