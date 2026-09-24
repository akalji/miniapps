import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'tools/kitchen', pathMatch: 'full', redirectTo: 'tools/kitchen/' },
  {
    path: 'tools/kitchen/',
    loadComponent: () => import('./pages/pickle-label-page').then((m) => m.PickleLabelPage),
  },
  { path: 'tools/pickle-label', pathMatch: 'full', redirectTo: 'tools/kitchen/' },
  { path: '**', redirectTo: '' },
];
