import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainView } from './views/MainView';

const routes: Routes = [
  { path: '', component: MainView }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
