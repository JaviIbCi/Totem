import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CollaboratorService } from '../services/collaborator.service';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collaborator-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collaborator-image.component.html',
  styleUrls: ['./collaborator-image.component.css'],
})
export class CollaboratorImageComponent implements OnInit {
  // Base URL de las imágenes
  imageBasePath: string = `https://totemvespucio.cl/assets/colaboradores/`;

  // Datos para las columnas
  filteredCollaborators: any[] = [];
  unassignedImages: any[] = [];

  // Control de selección
  selectedCollaborator: any = null;
  selectedImages: File[] = [];

  // ID de categoría
  categoryId: number | null = null;

  // Indicador de carga
  loading: boolean = false;

  isUploadModalOpen: boolean = false; // Control para mostrar el modal de subida

  formData = new FormData();
  assignments: any;

  constructor(
    private collaboratorService: CollaboratorService,
    private location: Location,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener el ID de categoría desde la URL y asignarlo a `categoryId`
    const categoryIdParam = this.route.snapshot.paramMap.get('categoryId');
    this.categoryId = categoryIdParam ? Number(categoryIdParam) : null;

    if (this.categoryId && !isNaN(this.categoryId)) {
      // Cargar colaboradores e imágenes de la categoría seleccionada
      this.loadCollaboratorsByCategory();
      this.loadUnassignedImages();
    } else {
      console.warn('No se recibió un ID de categoría válido.');
      alert('Error: No se recibió un ID de categoría válido.');
    }
  }

  // Cargar colaboradores por categoría
  loadCollaboratorsByCategory(): void {
    if (this.categoryId == null) {
      console.warn(
        'categoryId es nulo o indefinido. No se puede proceder con la carga de colaboradores.'
      );
      return;
    }

    this.collaboratorService.getAllCollaborators().subscribe(
      (response: any) => {
        if (
          response &&
          response.collaborators &&
          Array.isArray(response.collaborators)
        ) {
          // Filtrar colaboradores que pertenecen a la categoría seleccionada
          this.filteredCollaborators = response.collaborators.filter(
            (collaborator: any) =>
              Number(collaborator.id_collaborator_category) === this.categoryId
          );

          if (this.filteredCollaborators.length === 0) {
            console.warn(
              `No se encontraron colaboradores para la categoría con ID ${this.categoryId}`
            );
          }
        } else {
          console.warn(
            'La respuesta no contiene un array válido de colaboradores.'
          );
        }
      },
      (error) => {
        console.error(
          `Error al cargar colaboradores para la categoría ${this.categoryId}:`,
          error
        );
      }
    );
  }

  // Cargar imágenes sin asignar
  loadUnassignedImages(): void {
    this.collaboratorService.getUnassignedCollaboratorImages().subscribe(
      (response: any) => {
        this.unassignedImages = response.images || [];
      },
      (error) => {
        console.error('Error al cargar las imágenes sin asignar:', error);
      }
    );
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.selectedImages = []; // Limpiar la selección de imágenes cuando se cierra el modal
  }

  // Seleccionar colaborador
  selectCollaborator(collaborator: any): void {
    this.selectedCollaborator = collaborator;
  }

  // Obtener URL completa de una imagen
  getFullImagePath(uniqueName: string): string {
    if (!uniqueName) {
      console.warn('Nombre de imagen no proporcionado, mostrando imagen por defecto.');
      return 'https://totemvespucio.cl/assets/colaboradores/placeholder.png'; // Imagen genérica
    }
  
    const fullPath = `${this.imageBasePath}${uniqueName}`;
    console.log('URL completa para la imagen:', fullPath);
    return fullPath;
  }
  

  // Método para manejar la selección de archivos
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedImages = Array.from(event.target.files); // Guardar todos los archivos seleccionados en `selectedImages`
      console.log('Archivos seleccionados:', this.selectedImages);
    }
  }
  

  uploadImages(): void {
    // Verificar si hay imágenes seleccionadas
    if (this.selectedImages.length === 0) {
      alert('Por favor selecciona al menos un archivo para subir.');
      return;
    }
  
    // Mostrar mensaje de carga mientras se realiza la subida
    this.loading = true;
  
    // Llamar al servicio para subir las imágenes seleccionadas
    this.collaboratorService.uploadMultipleImages(this.selectedImages).subscribe(
      (response: any) => {
        // Manejar la respuesta del servidor
        console.log('Respuesta del servidor al subir las imágenes:', response);
        
        // Revisar si la subida fue exitosa
        if (response.success) {
          alert('Imágenes subidas exitosamente.');
          
          // Limpiar la selección de imágenes después de una subida exitosa
          this.selectedImages = [];
          
          // Recargar las imágenes no asignadas para reflejar los cambios
          this.loadUnassignedImages();
        } else {
          // Si hubo algún problema durante la subida, mostrar un mensaje al usuario
          alert('Ocurrió un problema al subir las imágenes. Verifica la respuesta del servidor.');
        }
      },
      (error: HttpErrorResponse) => {
        // Manejar errores de la solicitud
        console.error('Error al subir las imágenes:', error);
        alert('Hubo un error al subir las imágenes. Por favor intenta de nuevo.');
      },
      () => {
        // Siempre desactivar la carga independientemente de si hubo error o éxito
        this.loading = false;
      }
    );
  }
  
  
  assignImages(): void {
    if (this.assignments.length === 0) {
      alert('Por favor selecciona al menos una asignación.');
      return;
    }
  
    this.collaboratorService.assignImagesToCollaborators(this.assignments).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Imágenes asignadas exitosamente.');
          this.assignments = []; // Resetear asignaciones después de una subida exitosa
          this.loadUnassignedImages(); // Recargar imágenes sin asignar para actualizar el estado
          // Recargar la página después de la asignación
          window.location.reload();
        } else {
          alert('Ocurrió un problema al asignar las imágenes.');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al asignar imágenes:', error);
        alert('Error al asignar imágenes. Por favor intenta de nuevo.');
      },
    });
  }
  
  addAssignment(collaboratorId: string, imageId: string): void {
    const collaboratorIdNumber = parseInt(collaboratorId, 10);
    const imageIdNumber = parseInt(imageId, 10);
  
    if (isNaN(collaboratorIdNumber) || isNaN(imageIdNumber)) {
      console.error('Error: Los valores proporcionados no son números válidos.');
      return;
    }
  
    const assignment = {
      id_collaborator: collaboratorIdNumber,
      id_image: imageIdNumber,
    };
  
    this.collaboratorService.assignImagesToCollaborators([assignment]).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Imagen asignada exitosamente.');
          // Recargar la página después de la asignación
          window.location.reload();
        } else {
          alert('Ocurrió un problema al asignar la imagen.');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al asignar la imagen:', error);
        alert('Error al asignar la imagen. Por favor intenta de nuevo.');
      },
    });
  }
  

  // Método en el componente para eliminar todas las imágenes no asignadas
// Método en el componente para eliminar todas las imágenes no asignadas
deleteAllUnassignedImages(): void {
  if (confirm('¿Estás seguro de que deseas eliminar todas las imágenes sin asignar? Esta acción no se puede deshacer.')) {
    // Verificar que haya imágenes sin asignar
    if (this.unassignedImages.length === 0) {
      alert('No hay imágenes sin asignar para eliminar.');
      return;
    }

    // Iterar sobre todas las imágenes no asignadas y eliminarlas una por una
    let imagesToDelete = [...this.unassignedImages]; // Copiar el array para no modificar el original
    let errorOccurred = false;

    imagesToDelete.forEach((image, index) => {
      this.collaboratorService.deleteAllUnassignedImages(image.id_image).subscribe({
        next: (response) => {
          console.log(`Imagen con ID ${image.id_image} eliminada exitosamente.`);
          // Eliminar la imagen del array una vez se ha confirmado la eliminación
          this.unassignedImages = this.unassignedImages.filter((img) => img.id_image !== image.id_image);
        },
        error: (error: HttpErrorResponse) => {
          console.error(`Error al eliminar la imagen con ID ${image.id_image}:`, error);
          errorOccurred = true;
        },
        complete: () => {
          // Si hemos alcanzado el final de la lista, mostrar el estado
          if (index === imagesToDelete.length - 1) {
            if (errorOccurred) {
              alert('Ocurrieron errores al intentar eliminar algunas imágenes. Revisa la consola para más detalles.');
            } else {
              alert('Todas las imágenes sin asignar han sido eliminadas exitosamente.');
              this.loadUnassignedImages(); // Recargar la lista de imágenes después de eliminarlas
            }
          }
        }
      });
    });
  }
}


  

  // Volver atrás
  goBack(): void {
    this.location.back();
  }
}
