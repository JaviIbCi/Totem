import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapsCategoriesComponent } from './maps-categories/maps-categories.component'
import { MapsIndexComponent } from './maps-index/maps-index.component'

const routes: Routes = [
  { path: '', component: MapsCategoriesComponent }, 
  { path: 'map/:id_map', component: MapsIndexComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapsRoutingModule { }
