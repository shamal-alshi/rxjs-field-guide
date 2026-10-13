import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/landing/landing').then((m) => m.Landing) },
    {
        path: 'creation-and-subjects',
        loadComponent: () =>
            import('./features/creation-and-subjects/creation-and-subjects').then((m) => m.CreationAndSubjects),
    },
    { path: 'cold-and-hot', loadComponent: () => import('./features/cold-and-hot/cold-and-hot').then((m) => m.ColdAndHot) },
    { path: 'flattening', loadComponent: () => import('./features/flattening/flattening').then((m) => m.Flattening) },
    {
        path: 'error-handling',
        loadComponent: () => import('./features/error-handling/error-handling').then((m) => m.ErrorHandling),
    },
    { path: 'performance', loadComponent: () => import('./features/performance/performance').then((m) => m.Performance) },
    { path: '**', redirectTo: '' },
];