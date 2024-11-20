import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CollaboratorService } from '../services/collaborator.service';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

interface Collaborator {
  estado: string;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
  imagen: string;
}

@Component({
  selector: 'app-collaborator-categories',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './collaborator-categories.component.html',
  styleUrls: ['./collaborator-categories.component.css'],
})
export class CollaboratorCategoriesComponent implements OnInit {
  // Listado de grupos y categorías
  groupCategories: any[] = [];
  categories: any[] = [];
  // Nuevo grupo o categoría a agregar
  newGroupCategory: { name: string; type: boolean | null } = {
    name: '',
    type: null,
  };
  newCategory: any = { name: '' };
  // Estado del modal de agregar
  isAddingGroupCategory = false;
  isAddingCategory = false;
  // Estado del modal de confirmación de eliminación
  isDeletingGroupCategory = false;
  isDeletingCategory = false;
  // ID de la categoría a eliminar
  groupCategoryIdToDelete: number | null = null;
  CategoryIdToDelete: number | null = null;

  categoryId: number | null = null;

  selectedGroupCategoryId: number | null = null;

  errorMessage: string = ''; // Mensaje de error para la validación de categoría

  isEditingGroupCategory = false;

  editGroupCategoryData = { name: '' };

  editCategoryData = { id: null, name: '' };
  editingCategoryId: number | null = null;

  successMessage: string = '';
  isModalOpen: boolean = false;

  selectedCollaborator: any = {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    imagepath: '',
    is_active: false,
    id_category: null,
  };

  existingCollaborators: any[] = [];

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  validatedCollaborators: any[] = [];
  duplicateRecords: Collaborator[] = [];

  constructor(
    private collaboratorService: CollaboratorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroupCategories(); // Cargar grupo de categorías al iniciar el componente
    this.loadCategories(); // Cargar categorías al iniciar el componente
  }

  // Función para cargar las categorías después de editar
  loadGroupCategories(): void {
    this.collaboratorService.getAllCollaboratorCategories().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.groupCategories)) {
          this.groupCategories = data.groupCategories;
        } else {
          console.error('El valor recibido no es un arreglo:', data);
          this.groupCategories = []; // Asigna un arreglo vacío para evitar el error
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.groupCategories = []; // Asigna un arreglo vacío en caso de error
      },
    });
  }

  loadCategories(): void {
    this.collaboratorService.getAllCollaboratorCategories().subscribe(
      (response: any) => {
        const groupCategories = response.groupCategories || [];

        this.categories = groupCategories.reduce((acc: any[], group: any) => {
          const categories = (group.CollaboratorCategories || []).map(
            (category: any) => ({
              ...category,
              id_group_category: group.id_group_category,
              group_category_name: group.group_category_name,
              is_administrative: group.is_administrative,
            })
          );
          return acc.concat(categories);
        }, []);

      },
      (error: any) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }

  // Obtener categorías por ID de grupo
  getCategoriesByGroupId(groupId: number): any[] {
    const group = this.categories.filter(
      (category) => category.id_group_category === groupId
    );
    return group || [];
  }

  openExcelModal() {
    this.isModalOpen = true;
  }

  closeExcelModal() {
    this.isModalOpen = false;
  }

  loadExistingCollaborators(): void {
    this.collaboratorService.getAllCollaborators().subscribe({
      next: (data) => {
        this.existingCollaborators = data; // Carga los colaboradores existentes
      },
      error: (error) => {
        console.error('Error al cargar colaboradores existentes:', error);
      },
    });
  }
  file: File | null = null;
  // Método para procesar el archivo seleccionado y validarlo
  onExcelFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      console.warn('No se seleccionó ningún archivo.');
    } else {
      this.file = file;
    }
  }

  validateDuplicates(collaborators: Collaborator[]): void {
    const uniqueEmails = new Set();
    this.validatedCollaborators = [];
    this.duplicateRecords = [];

    collaborators.forEach((collaborator) => {
      // Usa el email como criterio de duplicado
      if (uniqueEmails.has(collaborator.email)) {
        this.duplicateRecords.push(collaborator); // Agrega a duplicados
      } else {
        uniqueEmails.add(collaborator.email);
        this.validatedCollaborators.push(collaborator); // Agrega a la lista validada
      }
    });

    if (this.duplicateRecords.length > 0) {
      alert(
        `Se encontraron ${this.duplicateRecords.length} registros duplicados y fueron omitidos.`
      );
    }
  }

  uploadValidatedCollaborators(): void {
    this.collaboratorService.uploadAllCollaborators(this.file).subscribe(
      (response: any) => {},
      (error: any) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }

  confirmUpload(): void {
    const userConfirmed = window.confirm(
      'Subir este archivo eliminará los datos existentes. ¿Estás seguro de que deseas continuar?'
    );

    if (userConfirmed) {
      this.uploadValidatedCollaborators();
    } else {
    }
  }

  confirmDownload(): void {
    const userConfirmed = window.confirm('¿Estás seguro de que deseas descargar el listado de colaboradores?');
  
    if (userConfirmed) {
      this.downloadCollaborators();
    } else {}
  }
  
  downloadCollaborators(): void {
    this.collaboratorService.downloadAllCollaborators().subscribe(
      (response: any) => {
        // Crea un blob con el contenido del archivo
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
  
        // Crea un enlace temporal para la descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
  
        // Nombre del archivo para descargar
        a.download = 'colaboradores.xlsx'; // Cambia el nombre según corresponda
        document.body.appendChild(a);
        a.click();
  
        // Limpia los recursos
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error: any) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }
  

  openModal(): void {
    this.isModalOpen = true;
    // Limpiar los campos de selectedCollaborator para un nuevo colaborador
    this.selectedCollaborator = {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      imagepath: '',
      is_active: false,
      id_category: this.categoryId, // Asignar la categoría actual
    };
  }

  // Abrir el modal para agregar una nueva categoría a un grupo específico
  openAddCategoryModal(groupCategoryId: number): void {
    this.selectedGroupCategoryId = groupCategoryId;
    this.isAddingCategory = true;
  }

  // Abrir el modal para agregar un nuevo grupo de categoría
  addGroupCategory(): void {
    this.isAddingGroupCategory = true;
    // Restablece los valores de newGroupCategory cada vez que se abre el modal
    this.newGroupCategory = { name: '', type: null };
  }

  // Abrir el modal para agregar una nueva categoría
  addCategory(): void {
    this.isAddingCategory = true;
  }

  // Guardar la nueva categoría de grupo y manejar el tipo
  saveNewGroupCategory(): void {
    // Validar que el nombre tenga al menos 3 caracteres
    if (
      !this.newGroupCategory.name ||
      this.newGroupCategory.name.trim().length < 3
    ) {
      this.errorMessage =
        'El nombre de la categoría debe tener al menos 3 caracteres.';
      return;
    }

    // Validar que el tipo de grupo (is_administrative) esté definido
    if (
      this.newGroupCategory.type === null ||
      this.newGroupCategory.type === undefined
    ) {
      this.errorMessage =
        'Por favor, selecciona si la categoría es Administrativa o Docente.';
      return;
    }

    // Preparar los datos de la solicitud según lo esperado por el backend
    const categoryData = {
      group_category_name: this.newGroupCategory.name.trim(),
      is_administrative: this.newGroupCategory.type ? 1 : 0, // Convertir a 1 para Administrativo y 0 para Docente
    };


    this.collaboratorService
      .createCollaboratorGroupCategory(categoryData)
      .subscribe({
        next: () => {
          // Resetea el estado del modal y el mensaje de error al guardar correctamente
          this.isAddingGroupCategory = false;
          this.errorMessage = '';
          this.loadGroupCategories(); // Recargar la lista de categorías
        },
        error: (error: any) => {
          // Muestra el mensaje de error en caso de fallo y verifica si es un problema de duplicado
          if (error.status === 400) {
            // Verifica si el mensaje de error coincide con "El nombre de la categoría ya existe"
            if (error.error.message.includes('ya existe')) {
              this.errorMessage =
                'El nombre de la categoría ya existe. Elige otro.';
            } else {
              this.errorMessage =
                error.error.message || 'Error al crear la categoría de grupo';
            }
          } else {
            this.errorMessage =
              'Error en el servidor al crear la categoría de grupo';
          }
          console.error('Error:', error);
        },
      });
  }

  // Guardar nueva categoría y asignarla al grupo
  saveNewCategory(): void {
    if (!this.newCategory.name.trim()) {
      this.errorMessage = 'El nombre de la categoría no puede estar vacío.';
      return;
    }
    if (this.selectedGroupCategoryId === null) {
      console.error(
        'Error: No se ha seleccionado un grupo de categoría para asociar.'
      );
      return;
    }

    const newCategoryData = {
      collaborator_category_name: this.newCategory.name, // Cambiado a la estructura esperada por el backend
      id_group_category: this.selectedGroupCategoryId,
    };


    this.collaboratorService
      .createCollaboratorCategory(newCategoryData)
      .subscribe(
        (response) => {
          this.closeAddCategoryModal();
          this.loadCategories(); // Recargar las categorías después de agregar
        },
        (error) => {
          console.error('Error al crear la nueva categoría:', error);
        }
      );
  }

  closeAddCategoryModal(): void {
    this.isAddingCategory = false;
    this.newCategory = { name: '' };
    this.selectedGroupCategoryId = null;
    this.errorMessage = '';
  }

  openEditCategoryModal(category: any): void {
    this.editingCategoryId = category.id_collaborator_category;
    this.editCategoryData = {
      id: category.id_collaborator_category,
      name: category.collaborator_category_name,
    };
  }

  // Función para cerrar el modal de edición y restablecer los datos
  closeEditCategoryModal(): void {
    this.editingCategoryId = null;
    this.editCategoryData = { id: null, name: '' };
    this.errorMessage = '';
  }

  // Función para guardar los cambios en el nombre de la categoría
  saveCategoryChanges(): void {
    if (
      this.editCategoryData.id !== null &&
      this.editCategoryData.name.trim().length >= 3
    ) {
      const updatedCategory = {
        collaborator_category_name: this.editCategoryData.name.trim(),
      };

      this.collaboratorService
        .updateCollaboratorCategory(this.editCategoryData.id, updatedCategory)
        .subscribe({
          next: () => {
            this.loadGroupCategories(); // Recargar categorías para reflejar el cambio
            this.closeEditCategoryModal();
            location.reload(); // Recargar la página
          },
          error: (error) => {
            this.errorMessage = 'Error al actualizar la categoría';
            console.error('Error:', error);
          },
        });
    } else {
      this.errorMessage = 'ID de categoría no válido o nombre demasiado corto';
    }
  }

  // Cancelar y cerrar el modal de agregar grupo de categoría
  cancelAddingGroup(): void {
    this.isAddingGroupCategory = false;
    this.errorMessage = '';
  }

  // Cancelar la adición de una nueva categoría
  cancelAdding(): void {
    this.isAddingCategory = false;
    this.newCategory = { name: '' };
    this.errorMessage = ''; // Limpiar mensaje de error al cancelar
  }
  // Preparar y confirmar la eliminación de un grupo de categoría usando una alerta
  prepareDeleteGroupCategory(groupCategoryId: number): void {
    // Muestra una alerta de confirmación
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este grupo?'
    );

    // Si el usuario confirma, procede con la eliminación
    if (confirmDelete) {
      this.confirmDeleteGroupCategory(groupCategoryId);
    } else {
      // Si el usuario cancela, no hace nada
    }
  }

  // Confirmar la eliminación de un grupo de categoría
  confirmDeleteGroupCategory(groupCategoryId: number): void {
    this.collaboratorService
      .deleteCollaboratorGroupCategory(groupCategoryId)
      .subscribe(() => {
        this.loadGroupCategories(); // Recargar categorías después de eliminar
      });
  }

  deleteCategory(categoryId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este grupo?')) {

      this.collaboratorService.deleteCollaboratorCategory(categoryId).subscribe(
        (response) => {
          this.loadCategories(); // Recargar las categorías después de eliminar
        },
        (error) => {
          console.error('Error al eliminar :', error);
        }
      );
    } else {
    }
  }

  // Cancelar la eliminación de un grupo de categoría
  cancelDeleteGroup(): void {
    this.isDeletingGroupCategory = false;
    this.groupCategoryIdToDelete = null;
  }

  // Cancelar la eliminación de una categoría
  cancelDelete(): void {
    this.isDeletingCategory = false;
    this.CategoryIdToDelete = null;
  }

  //Editar

  // Abrir el modal de edición y cargar los datos actuales de la categoría
  openEditModal(groupCategoryId: number): void {
    this.isEditingGroupCategory = true;
    this.selectedGroupCategoryId = groupCategoryId;
    const category = this.groupCategories.find(
      (cat) => cat.id_group_category === groupCategoryId
    );
    this.editGroupCategoryData = { name: category?.group_category_name || '' };
  }

  // Cerrar el modal de edición
  closeEditModal(): void {
    this.isEditingGroupCategory = false;
    this.selectedGroupCategoryId = null;
    this.errorMessage = '';
  }

  // Llama al servicio para actualizar la categoría de grupo
  updateGroupCategory(): void {
    if (!this.selectedGroupCategoryId) {
      this.errorMessage = 'ID de categoría de grupo inválido.';
      return;
    }

    // Validar el nombre de la categoría antes de enviar la solicitud
    if (!this.validateCategoryName(this.editGroupCategoryData.name)) {
      return;
    }

    // Asegurarse de que el objeto tenga el formato correcto
    const groupCategoryData = {
      group_category_name: this.editGroupCategoryData.name.trim(), // Trim para quitar espacios adicionales
    };


    this.collaboratorService
      .updateCollaboratorGroupCategory(
        this.selectedGroupCategoryId,
        groupCategoryData
      )
      .subscribe({
        next: () => {
          // Actualiza el nombre de la categoría en la lista local
          const category = this.groupCategories.find(
            (cat) => cat.id_group_category === this.selectedGroupCategoryId
          );
          if (category)
            category.group_category_name = this.editGroupCategoryData.name;
          this.closeEditModal();
        },
        error: (error) => {
          // Muestra un mensaje de error si falla la actualización
          this.errorMessage = 'Error al actualizar la categoría';
          console.error('Error en la actualización:', error); // Detalles del error en consola
        },
      });
  }

  validateCategoryName(name: string): boolean {
    if (!name || name.trim().length < 3) {
      this.errorMessage =
        'El nombre de la categoría debe tener al menos 3 caracteres.';
      return false;
    }
    return true;
  }

  // Reordenar grupo de categorías
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(
      this.groupCategories,
      event.previousIndex,
      event.currentIndex
    );

    // Actualizar el orden en el backend
    const isAdministrative =
      this.groupCategories[event.currentIndex].is_administrative;
    this.updateGroupCategoryOrder(isAdministrative);
  }

  // Enviar el nuevo orden al backend
  updateGroupCategoryOrder(is_administrative: boolean): void {
    // Filter groupCategories based on the is_administrative parameter
    const filteredgroupCategories = this.groupCategories.filter(
      (groupcategory) => groupcategory.is_administrative == is_administrative
    );

    // Map the filtered categories to the desired format
    const order = filteredgroupCategories.map((cgroupcategory) => ({
      id_group_category: cgroupcategory.id_group_category,
    }));

    // Create the data object to send
    const dataToSend = {
      is_administrative,
      order: order,
    };

    this.collaboratorService
      .reorderCollaboratorGroupCategories(dataToSend)
      .subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.error('Error al reordenar las categorías:', error);
        }
      );
  }
  dropCategory(event: CdkDragDrop<any[]>): void {
    // Reordenar el array `categories` localmente
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);

    // Actualizar el orden en el backend para las categorías
    const isAdministrative =
      this.categories[event.currentIndex].is_administrative;
    this.updateCategoryOrder(isAdministrative);
  }

  // Enviar el nuevo orden al backend para las categorías
  updateCategoryOrder(is_administrative: boolean): void {
    // Filtrar las categorías según el parámetro `is_administrative`
    const filteredCategories = this.categories.filter(
      (category) => category.is_administrative == is_administrative
    );

    // Mapear las categorías filtradas al formato requerido
    const order = filteredCategories.map((category) => ({
      id_category: category.id_category,
    }));

    // Crear el objeto de datos para enviar
    const dataToSend = {
      is_administrative,
      order: order,
    };

    this.collaboratorService
      .reorderCollaboratorCategories(dataToSend)
      .subscribe(
        (response: any) => {},
        (error: any) => {
          console.error('Error al reordenar las categorías:', error);
        }
      );
  }

  // Navegar a la página de colaboradores de una categoría específica
  navigateToCollaborators(categoryId: number): void {
    this.router.navigate(['collaborator/index', categoryId]);
  }
}
