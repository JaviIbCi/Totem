import { Component,OnInit } from '@angular/core';
import { InformationService } from '../services/information.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para usar ngModel
import { RouterLink, Router } from '@angular/router';
 
@Component({
  selector: 'app-information-categories',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './information-categories.component.html',
  styleUrl: './information-categories.component.css'
})
export class InformationCategoriesComponent implements OnInit  {
  constructor (private informationService:InformationService){}
 
  ngOnInit(): void {
    this.informationService.getAllinformations().subscribe(
      (response: any) => {
        console.log("hola estas son mis categorias: ",response.informations);
        //Aqui va la logica para procesar las categorias obtenidas con response.informations


      },
      (error: any) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  hasPermission(permissionId: number, categoryId?: number | null): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;
  
      // Verifica si el permiso es categórico o modular, y también si tiene el permiso 1 o 9
      if (categoryId) {
        return currentUserPermissions.some((p: any) =>
          (p.id_permission === permissionId && p.faq_category?.id_faq_category === categoryId) || p.id_permission === 1 || p.id_permission === 9
        );
      } else {
        return currentUserPermissions.some((p: any) =>
          p.id_permission === permissionId || p.id_permission === 1 || p.id_permission === 9
        );
      }
    }
    return false;
  }
  









  
}
