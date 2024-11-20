import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Asegúrate de importar FormsModule
import { IndexCollaboratorComponent } from './index-collaborator/index-collaborator.component';
import { CollaboratorRoutingModule } from './collaborator-routing.module'; // Importar el módulo de rutas
import { ButtonModule } from 'primeng/button';  // Importar PrimeNG ButtonModule
import { InputTextModule } from 'primeng/inputtext'; 


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    FormsModule,
    CollaboratorRoutingModule,
    ButtonModule,  // Añadir PrimeNG ButtonModule
    InputTextModule
  ]
})
export class CollaboratorModule { }
