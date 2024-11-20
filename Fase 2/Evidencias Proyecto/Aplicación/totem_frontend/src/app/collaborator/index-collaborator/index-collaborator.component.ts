// index-collaborator.component.ts

import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollaboratorService } from '../../services/collaborator.service';
import { GlobalService } from '../../services/global.service';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import { ChangeDetectorRef } from '@angular/core';
import { Console } from 'node:console';

/**
 * Componente para mostrar e interactuar con colaboradores.
 */
@Component({
  selector: 'app-index-collaborator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index-collaborator.component.html',
  styleUrls: ['./index-collaborator.component.css'],
})
export class IndexCollaboratorComponent implements OnInit, AfterViewInit {
  // Categorías de colaboradores
  categories: any = { Administrativos: {}, Docentes: {} };

  // Listas de colaboradores
  collaborators: any[] = [];
  filteredCollaborators: any[] = [];
  paginatedCollaborators: any[] = [];

  // Filtros seleccionados
  selectedGroup: string = 'Docentes';
  selectedCategory: string | null = null;
  openCategories: { [key: string]: boolean } = {};

  // Término de búsqueda y visibilidad del teclado
  searchTerm: string = '';
  isKeyboardVisible: boolean = false;

  // Detección de plataforma
  isBrowser: boolean;
  isTotemView: boolean = false;
  isMobileView: boolean = false;
  isReady: boolean = false;

  // Instancia del teclado virtual
  keyboard!: Keyboard;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 30; // Se recalculará según el tamaño de la pantalla
  totalPages: number = 1;
  paginationArray: (number | string)[] = [];

  // Temporizador para debounce en la búsqueda
  private searchTimeout: any = null;

  constructor(
    private collaboratorService: CollaboratorService,
    private globalService: GlobalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    // Detecta si se está ejecutando en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Al inicializar el componente.
   */
  ngOnInit(): void {
    this.registerClick("home","visit","collaborators");
    this.detectViewMode();
    this.fetchCollaboratorCategories();
    this.fetchAllCollaborators();
  }

  /**
   * Después de inicializar la vista.
   */
  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Forzar detección de cambios
  }

  /**
   * Escucha eventos de cambio de tamaño de ventana para detectar el modo de vista dinámicamente.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.detectViewMode();
    this.updatePagination();
  }

  /**
   * Detecta el modo de vista actual basado en el tamaño de pantalla.
   */
  detectViewMode(): void {
    if (this.isBrowser) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Detección de vista "totem"
      if (width >= 2160 && height >= 3840) {
        this.isTotemView = true;
        this.isMobileView = false;
      }
      // Detección de vista móvil
      else if (width < 850) {
        this.isTotemView = false;
        this.isMobileView = true;
      }
      // Vista de PC
      else {
        this.isTotemView = false;
        this.isMobileView = false;
      }

      // Re-inicializar teclado si es necesario
      if (this.isKeyboardVisible && !this.isTotemView) {
        // Ocultar teclado si no está en vista "totem"
        this.isKeyboardVisible = false;
      }

      // Ajustar expansión de categorías según la vista
      this.adjustCategoryExpansion();
    }
  }

  /**
   * Calcula el número de elementos por página basado en el tamaño de pantalla.
   */
  calculateItemsPerPage(): void {
    if (this.isBrowser) {
        const container = document.querySelector('.cards-wrapper') as HTMLElement;

        if (container) {
            const containerWidth = container.offsetWidth;
            let containerHeight = container.offsetHeight;

            // Si la altura del contenedor es 0, usa la altura de la ventana como valor predeterminado
            if (containerHeight <= 0) {
                containerHeight = window.innerHeight * 0.8; // 80% de la ventana como fallback
            }
            console.log(containerWidth,containerHeight)
            const cardWidth = 220; // Ajustar a la media query
            const cardHeight = 273;
            const gap = 10;

            const columns = Math.floor((containerWidth + gap) / (cardWidth + gap));
            const rows = 6;

            let itemsPerPage = columns * rows;

            if (window.innerWidth < 500) {
                itemsPerPage = Math.floor(itemsPerPage / 2) * 2;
            } else if (window.innerWidth < 720) {
                itemsPerPage = Math.floor(itemsPerPage / 3) * 3;
            } else if (window.innerWidth >= 2160 && window.innerHeight >= 3840) {
                itemsPerPage = 20;
            }

            this.itemsPerPage = itemsPerPage > 12 ? itemsPerPage : 12;
            this.isReady = true;

            console.log('Items per page:', containerWidth, containerHeight, this.itemsPerPage);
        } else {
            console.error('Contenedor .cards-wrapper no encontrado');
        }
    }
}

  
  
  
  /**
   * Ajusta la expansión de categorías según la vista actual.
   */
  adjustCategoryExpansion(): void {
    if (this.isMobileView) {
      // Colapsar todas las categorías
      this.openCategories = {};
    } else {
      // Expandir todas las categorías
      const allGroups = [
        ...this.getDocenteGroups(),
        ...this.getAdministrativeGroups(),
      ];
      allGroups.forEach((group) => {
        this.openCategories[group] = true;
      });
    }
  }

  /**
   * Abre el teclado virtual.
   */
  openVirtualKeyboard(): void {
    if (this.isBrowser && this.isTotemView) {
      this.isKeyboardVisible = true;
      setTimeout(() => {
        this.initializeKeyboard();
      }, 100);
    }
  }

  /**
   * Cierra el teclado virtual.
   */
  closeVirtualKeyboard(): void {
    this.isKeyboardVisible = false;
  }

  /**
   * Inicializa el teclado virtual.
   */
  initializeKeyboard(): void {
    const keyboardElement = document.querySelector('#keyboard');

    if (keyboardElement) {
      if (this.keyboard) {
        this.keyboard.destroy();
      }

      const keyboardOptions: any = {
        onChange: (input: string) => this.onInputChange(input),
        onKeyPress: (button: string) => this.onKeyPress(button),
        theme: 'hg-theme-default hg-layout-default',
        container: keyboardElement,
        layout: {
          default: [
            'Q W E R T Y U I O P {bksp}',
            'A S D F G H J K L Ñ {enter}',
            'Z X C V B N M',
            '{space}',
          ],
        },
        display: {
          '{bksp}': 'Borrar',
          '{enter}': 'Enter',
          '{space}': 'Espacio',
        },
        buttonTheme: [
          {
            class: 'hg-button-custom',
            buttons:
              'Q W E R T Y U I O P A S D F G H J K L Ñ Z X C V B N M {bksp} {enter} {space}',
          },
        ],
      };

      this.keyboard = new Keyboard(keyboardOptions);

      // Aplicar estilos a los botones
      const buttons = keyboardElement.querySelectorAll('.hg-button');
      buttons.forEach((button) => {
        const htmlButton = button as HTMLElement;
        htmlButton.style.fontSize = '90px';
        htmlButton.style.height = '150px';
        htmlButton.style.lineHeight = '120px';
        htmlButton.style.background = 'rgba(255, 255, 255, 0.7)'; // Fondo semi-transparente
      });

      // Centrar y estilizar el teclado
      const keyboardElementStyle = keyboardElement as HTMLElement;
      keyboardElementStyle.style.position = 'fixed';
      keyboardElementStyle.style.top = '50%';
      keyboardElementStyle.style.left = '50%';
      keyboardElementStyle.style.transform = 'translate(-50%, 100%)'; // Centrar teclado
      keyboardElementStyle.style.width = '100%';
      keyboardElementStyle.style.height = '660px';
      keyboardElementStyle.style.background = 'rgba(255, 255, 255, 0.5)';
      keyboardElementStyle.style.zIndex = '1000';
      keyboardElementStyle.style.borderRadius = '10px';
      keyboardElementStyle.style.padding = '20px';
      keyboardElementStyle.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }
  }

  /**
   * Maneja los cambios de input desde el teclado virtual.
   * @param input El valor actual del input.
   */
  onInputChange(input: string): void {
    this.searchTerm = input;
    this.searchCollaborators();
  }

  /**
   * Maneja las teclas presionadas en el teclado virtual.
   * @param button El botón que fue presionado.
   */
  onKeyPress(button: string): void {
    if (button === '{enter}') {
      this.closeVirtualKeyboard();
    }
    
    if (button === '{bksp}') {
      this.searchTerm = this.searchTerm.slice(0, -1); // Elimina el último carácter del campo de texto
    }
  }
  

  /**
   * Detecta clics fuera del teclado virtual para cerrarlo.
   * @param event El evento de clic.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isKeyboardVisible && this.isTotemView) {
      const clickedInsideKeyboard = (event.target as HTMLElement).closest(
        '.keyboard-container'
      );
      const clickedOnSearchBar = (event.target as HTMLElement).closest(
        '.search-bar'
      );
      if (!clickedInsideKeyboard && !clickedOnSearchBar) {
        this.closeVirtualKeyboard();
      }
    }
  }

  /**
   * Obtiene las categorías de colaboradores desde el servicio.
   */
  fetchCollaboratorCategories(): void {
    this.collaboratorService.getCollaboratorCategories().subscribe({
      next: (data) => {
        this.categories = data.result;
        this.adjustCategoryExpansion();
      },
      error: (err) => console.error('Error fetching categories', err),
    });
  }

  /**
   * Obtiene todos los colaboradores desde el servicio.
   */
  fetchAllCollaborators(): void {
    this.collaboratorService.getCollaborators().subscribe({
      next: (data) => {
        this.collaborators = data.collaborators;
        this.filteredCollaborators = [...this.collaborators];
        this.calculateItemsPerPage();
        this.updatePagination();
      },
      error: (err) => console.error('Error fetching collaborators', err),
    });
  }

  /**
   * Actualiza la paginación según los colaboradores filtrados.
   */
  updatePagination(): void {
    // Asegurar que totalPages sea al menos 1
    this.totalPages = Math.max(
      Math.ceil(this.filteredCollaborators.length / this.itemsPerPage),
      1
    );

    // Generar el arreglo de paginación
    this.generatePaginationArray();

    // Actualizar los colaboradores a mostrar en la página actual
    this.updatePaginatedCollaborators();
  }

  /**
   * Genera el arreglo de paginación con lógica avanzada.
   */
  private generatePaginationArray(): void {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
  
    const delta = 2; // Número de páginas a mostrar antes y después del actual (total 5)
    const paginationArray: (number | string)[] = [];
  
    // Mostrar siempre la primera página
    paginationArray.push(1);
  
    // Páginas centrales
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);
  
    // Asegurar un mínimo de 5 páginas visibles si es posible
    if (currentPage - delta <= 1) {
      end = Math.min(totalPages - 1, end + (delta - (currentPage - 2)));
    }
  
    if (currentPage + delta >= totalPages) {
      start = Math.max(2, start - ((currentPage + delta) - totalPages + 1));
    }
  
    // Agregar puntos si hay un salto entre el 1 y el inicio visible
    if (start > 2) {
      paginationArray.push('...');
    }
  
    // Agregar páginas visibles alrededor de la actual
    for (let i = start; i <= end; i++) {
      paginationArray.push(i);
    }
  
    // Agregar puntos si hay un salto entre el final visible y la última página
    if (end < totalPages - 1) {
      paginationArray.push('...');
    }
  
    // Agregar siempre la última página
    if (totalPages > 1) {
      paginationArray.push(totalPages);
    }
  
    this.paginationArray = paginationArray;
  }
  
  /**
   * Actualiza la lista de colaboradores mostrados en la página actual.
   */
  updatePaginatedCollaborators(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCollaborators = this.filteredCollaborators.slice(
      startIndex,
      endIndex
    );
  }

  /**
   * Navega a la página anterior.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Navega a la página siguiente.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Va a una página específica.
   * @param page El número de página al que navegar.
   */
  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Filtra colaboradores por grupo (Docentes o Administrativos).
   * También registra un evento de clic para la selección de grupo.
   * @param group El grupo por el cual filtrar.
   */
  filterByGroup(group: string): void {
    this.selectedGroup = group;
    this.selectedCategory = null;
    this.openCategories = {};

    if (group === 'Administrativos') {
      this.filteredCollaborators = this.collaborators.filter(
        (collaborator: any) =>
          collaborator.is_administrative === 'Administrativo'
      );
    } else if (group === 'Docentes') {
      this.filteredCollaborators = this.collaborators.filter(
        (collaborator: any) => collaborator.is_administrative === 'Docente'
      );
    }

    this.currentPage = 1;
    this.updatePagination();

    // Registrar evento de clic
    this.registerClick('collaborators', 'group', group);

    // Ajustar expansión de categorías
    this.adjustCategoryExpansion();
  }

  /**
   * Filtra colaboradores por categoría dentro del grupo seleccionado.
   * También registra un evento de clic para la selección de categoría.
   * @param category La categoría por la cual filtrar.
   */
  filterByCategory(category: string): void {
    this.selectedCategory = category;

    if (this.selectedGroup === 'Docentes') {
      this.filteredCollaborators = this.collaborators.filter(
        (collaborator: any) =>
          collaborator.is_administrative === 'Docente' &&
          collaborator.category_name === category
      );
    } else if (this.selectedGroup === 'Administrativos') {
      this.filteredCollaborators = this.collaborators.filter(
        (collaborator: any) =>
          collaborator.is_administrative === 'Administrativo' &&
          collaborator.category_name === category
      );
    }
    this.currentPage = 1;
    this.updatePagination();

    // Registrar evento de clic
    this.registerClick('collaborators', 'category', category);
  }

  /**
   * Busca colaboradores basado en el término de búsqueda con un debounce de 1 segundo.
   */
  searchCollaborators(): void {
    // Limpiar temporizador existente
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Establecer nuevo temporizador
    this.searchTimeout = setTimeout(() => {
      this.executeSearch();
    }, 1000); // Espera 1 segundo después de que el usuario deja de escribir
  }

  /**
   * Ejecuta la búsqueda y actualiza los colaboradores filtrados.
   */
  private executeSearch(): void {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.filteredCollaborators = this.collaborators.filter(
      (collaborator) =>
        collaborator.first_name.toLowerCase().includes(searchTermLower) ||
        collaborator.last_name.toLowerCase().includes(searchTermLower) ||
        collaborator.email.toLowerCase().includes(searchTermLower) ||
        collaborator.role.toLowerCase().includes(searchTermLower)
    );

    this.currentPage = 1;
    this.updatePagination();

    // Registrar búsqueda si el término no está vacío
    if (this.searchTerm.trim() !== '') {
      this.registerSearch('collaborators', 'search', this.searchTerm);
    }
  }

  /**
   * Alterna el estado abierto de una categoría.
   * En vista móvil, solo una categoría puede estar expandida a la vez.
   * @param group El grupo cuya categoría se alterna.
   */
  toggleCategory(group: string): void {
    if (this.isMobileView) {
      // Cerrar otras categorías abiertas
      Object.keys(this.openCategories).forEach((key) => {
        if (key !== group) {
          this.openCategories[key] = false;
        }
      });
    }

    // Alternar la categoría seleccionada
    this.openCategories[group] = !this.openCategories[group];
  }

  /**
   * Recupera categorías por grupo.
   * @param group El grupo del cual recuperar categorías.
   * @returns Un array de categorías.
   */
  getCategoriesByGroup(group: string): any[] {
    if (this.selectedGroup === 'Docentes') {
      return this.getDocenteCategories(group);
    } else if (this.selectedGroup === 'Administrativos') {
      return this.getAdministrativeCategories(group);
    }
    return [];
  }

  /**
   * Verifica si una categoría está abierta.
   * @param group El grupo a verificar.
   * @returns True si la categoría está abierta, false de lo contrario.
   */
  isCategoryOpen(group: string): boolean {
    return this.openCategories[group] || false;
  }

  /**
   * Obtiene los grupos administrativos.
   * @returns Un array de nombres de grupos administrativos.
   */
  getAdministrativeGroups(): string[] {
    return Object.keys(this.categories.Administrativos);
  }

  /**
   * Obtiene categorías administrativas dentro de un grupo.
   * @param group El grupo del cual obtener categorías.
   * @returns Un array de categorías.
   */
  getAdministrativeCategories(group: string): any[] {
    return this.categories.Administrativos[group];
  }

  /**
   * Obtiene los grupos de docentes.
   * @returns Un array de nombres de grupos de docentes.
   */
  getDocenteGroups(): string[] {
    return Object.keys(this.categories.Docentes);
  }

  /**
   * Obtiene categorías de docentes dentro de un grupo.
   * @param group El grupo del cual obtener categorías.
   * @returns Un array de categorías.
   */
  getDocenteCategories(group: string): any[] {
    return this.categories.Docentes[group];
  }

  /**
   * Registra un evento de clic llamando al servicio global.
   * @param component El componente donde ocurrió el clic.
   * @param selection El tipo de selección realizada.
   * @param details Detalles adicionales sobre el clic.
   */
  private registerClick(
    component: string,
    selection: string,
    details: string
  ): void {
    this.globalService.addClickLog(component, selection, details).subscribe({
      next: (response: any) => {
        // Click registrado exitosamente
      },
      error: (error: any) => {
        console.error('Error registering click log:', error);
      },
    });
  }

  /**
   * Registra un evento de búsqueda llamando al servicio global.
   * @param component El componente donde ocurrió la búsqueda.
   * @param selection El tipo de selección realizada.
   * @param details Detalles adicionales sobre la búsqueda.
   */
  private registerSearch(
    component: string,
    selection: string,
    details: string
  ): void {
    this.globalService.addSearchLog(component, selection, details).subscribe({
      next: (response: any) => {
        // Búsqueda registrada exitosamente
      },
      error: (error: any) => {
        console.error('Error registering search log:', error);
      },
    });
  }

  /**
}   * Maneja la selección de una tarjeta de colaborador.
   * También registra un evento de clic para la selección del colaborador.
   * @param collaborator El colaborador seleccionado.
   */
  selectCollaborator(collaborator: any): void {
    // Lógica de selección de colaborador

    // Registrar evento de clic
    const collaboratorName = `${collaborator.first_name} ${collaborator.last_name}`;
    this.registerClick('collaborators', 'collaborator', collaboratorName);
  }

  /**
   * Maneja errores al cargar imágenes reemplazando la fuente con una imagen alternativa.
   * @param event El evento de error.
   * @param fallbackSrc La fuente de la imagen alternativa.
   */
  onImageError(event: Event, fallbackSrc: string): void {
    const target = event.target as HTMLImageElement;
    target.src = fallbackSrc;
  }
}
