import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/index';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/dashboard' }
];
