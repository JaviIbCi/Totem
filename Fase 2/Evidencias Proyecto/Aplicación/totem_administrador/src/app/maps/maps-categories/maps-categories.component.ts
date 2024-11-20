import { Component,OnInit } from '@angular/core';
import { MapsService } from '../services/maps.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para usar ngModel
import { RouterLink, Router } from '@angular/router';
 
@Component({
  selector: 'app-maps-categories',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './maps-categories.component.html',
  styleUrl: './maps-categories.component.css'
})
export class MapsCategoriesComponent implements OnInit  {
  constructor (private mapsService:MapsService,private router: Router){}
  // Datos estáticos para los edificios y pisos
  buildings = {
    'Boulevard': [
      { floor: 1, id: 1 },
      { floor: 2, id: 2 },
      { floor: 3, id: 3 }
    ],
    'Sede Principal': [
      { floor: 1, id: 4 },
      { floor: 5, id: 5 },
      { floor: 6, id: 6 },
      { floor: 7, id: 7 }
    ]
  };
  ngOnInit(): void {

  }

  hasPermission(permissionId: number, categoryId?: number | null): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;
  
      // Verifica si el permiso es categórico o modular, y también si tiene el permiso 1 o 6
      if (categoryId) {
        return currentUserPermissions.some((p: any) =>
          (p.id_permission === permissionId && p.faq_category?.id_faq_category === categoryId) || p.id_permission === 1 || p.id_permission === 6
        );
      } else {
        return currentUserPermissions.some((p: any) =>
          p.id_permission === permissionId || p.id_permission === 1 || p.id_permission === 6
        );
      }
    }
    return false;
  }
  navigateToMap(mapId: number) {
    this.router.navigate(['/maps/map', mapId]);
  }
}