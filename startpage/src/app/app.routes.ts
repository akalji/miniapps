import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  {
    path: 'tools/kitchen/jar-labler',
    loadComponent: () => import('./pages/jar-labler-page').then((m) => m.JarLablerPage),
  },
  { path: '**', redirectTo: '' },
];
