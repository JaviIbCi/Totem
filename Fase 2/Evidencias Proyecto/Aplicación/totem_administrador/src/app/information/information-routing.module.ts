import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformationCategoriesComponent } from './information-categories/information-categories.component'
import { InformationIndexComponent } from './information-index/information-index.component'

const routes: Routes = [
  { path: '', component: InformationCategoriesComponent }, 
  { path: 'page/:id_info', component: InformationIndexComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationRoutingModule { }
