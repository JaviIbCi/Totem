import { Routes } from '@angular/router';
import { IndexCollaboratorComponent as Collaborator } from './collaborator/index-collaborator/index-collaborator.component';
import { IndexFaqComponent as Faq } from './faq/index-faq/index-faq.component';
import { IndexInformationComponent as Information } from './information/index-information/index-information.component';
import { CategoryInformationComponent as InformationCategory } from './information/category-information/category-information.component';
import { IndexMapComponent as Map } from './maps/index-map/index-map.component';

export const routes: Routes = [
  { path: 'colaboradores', component: Collaborator },
  { path: 'preguntas-frecuentes', component: Faq },
  { path: 'informacion-area/:name', component: Information },
  { path: 'mapa', component: Map },
  { path: '', component: InformationCategory },
  { path: '**', redirectTo: '', pathMatch: 'full' } 
];

