import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainView } from './views/MainView';

const routes: Routes = [
  { path: '', redirectTo: '/prva', pathMatch: 'full' },
  { path: ':category', component: MainView },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
