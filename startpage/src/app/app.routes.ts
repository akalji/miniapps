import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  {
    path: 'tools/kitchen/jar-labler',
    loadComponent: () => import('./pages/pickle-label-page').then((m) => m.PickleLabelPage),
  },
  { path: 'tools/kitchen', pathMatch: 'full', redirectTo: 'tools/kitchen/jar-labler' },
  { path: 'tools/kitchen/', pathMatch: 'full', redirectTo: 'tools/kitchen/jar-labler' },
  { path: 'tools/pickle-label', pathMatch: 'full', redirectTo: 'tools/kitchen/jar-labler' },
  { path: '**', redirectTo: '' },
];
