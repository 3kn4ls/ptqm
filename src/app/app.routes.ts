import { Routes } from '@angular/router';

import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { QuayComponent } from './components/quay/quay.component';

export const routes: Routes = [
  { path: '', component: QuayComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent } 
];
