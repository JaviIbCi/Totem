// index-map.component.ts
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapsService } from '../services/maps.service';
import { GlobalService } from '../../services/global.service';
import { ChangeDetectorRef } from '@angular/core';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

interface POI {
  id: number;
  categoryId: number;
  x: number;
  y: number;
  point_name: string;
  relatedId: number | null;
  iconId: number;
  iconName: string;
  width: number;
  height: number;
  color: string;
  mapId: number;
  originalWidth: number;
  originalHeight: number;
  isEnlarged: boolean;
}

@Component({
  selector: 'app-index-map',
  templateUrl: './index-map.component.html',
  styleUrls: ['./index-map.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class IndexMapComponent implements OnInit {
  // Variables for map data
  maps: any = {}; // Map data received from the API
  currentMap: any = null; // Currently selected map
  mapImageUrl: string = ''; // URL of the current map image

  // Variables for image dimensions
  imageWidth: number = 0; // Width of the map image
  imageHeight: number = 0; // Height of the map image
  svgWidth: number = 1000; // Width of the SVG (default)
  svgHeight: number = 1000; // Height of the SVG (default)

  // Variables for points of interest
  pointsOfInterest: POI[] = []; // List of all points of interest
  currentPoints: POI[] = []; // Points of interest for the current map
  filteredPoints: POI[] = []; // Points of interest filtered by search
  pointsLeyend: POI[] = []; // Puntos de interés de categoría 1 para leyendas

  // Variables for building and floor selection
  selectedBuilding: string = 'Edificio Boulevard'; // Default building
  selectedFloor: number = 2; // Default floor

  // Variables for panning and zooming
  zoomLevel: number = 100; // Initial zoom level
  panOffsetX: number = 0; // Horizontal pan offset
  panOffsetY: number = 0; // Vertical pan offset
  isPanning: boolean = false; // Flag to indicate if panning is active
  panStartX: number = 0; // Starting X position for panning
  panStartY: number = 0; // Starting Y position for panning

  // Variables for search functionality
  searchQuery: string = ''; // User's search query
  filteredSuggestions: POI[] = []; // Suggestions for autocomplete
  searchTimeout: any = null; // Timer for debounce in search

  // Variables for bubbles (tooltips)
  bubbleTitle: string | null = null; // Title of the bubble
  bubbleX: number = 0; // X position of the bubble
  bubbleY: number = 0; // Y position of the bubble
  bubbleWidth: number = 0; // Dynamic width of the bubble
  bubbleHeight: number = 30; // Fixed height of the bubble
  bubbleTailHeight: number = 10; // Height of the bubble tail

  // Map ID to Building and Floor mapping
  mapIdToBuildingAndFloor: { [key: number]: { building: string; floor: number } } = {
    1: { building: 'Edificio Boulevard', floor: 1 },
    2: { building: 'Edificio Boulevard', floor: 2 },
    3: { building: 'Edificio Boulevard', floor: 3 },
    4: { building: 'Sede Principal', floor: 1 },
    5: { building: 'Sede Principal', floor: 5 },
    6: { building: 'Sede Principal', floor: 6 },
    7: { building: 'Sede Principal', floor: 7 },
  };

  isBrowser: boolean = false;

  constructor(
    private mapsService: MapsService,
    private globalService: GlobalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef // Inyección del ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Detect if running in browser
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Register initial visit to the maps component
    this.registerClick('home', 'visit', 'maps');

    // Load maps
    this.loadMaps();
    this.checkTotemMode(); // Verificar modo de tótem
  }
  isTotem:boolean=false;
  private checkTotemMode(): void {
    if (this.isBrowser) { // Asegura que solo se ejecute en el navegador
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      // Cambia a modo totem si las dimensiones coinciden con 2160x3840
      this.isTotem = windowWidth === 2160 && windowHeight === 3840;
    }
  }
  @HostListener('window:resize', [])
  onResize(): void {
    if (this.isBrowser) { // Asegura que solo se ejecute en el navegador
      this.checkTotemMode();
    }
  }
  isKeyboardVisible:boolean=false;
  openVirtualKeyboard(): void {
    if (this.isTotem) {
      this.isKeyboardVisible = true;
      this.cdr.detectChanges(); // Forzar la detección de cambios
      this.initializeKeyboard();
    }
  }
  
  keyboard!: Keyboard;
  closeVirtualKeyboard(): void {
    this.isKeyboardVisible = false;
    if (this.keyboard) {
      this.keyboard.destroy();
    }
  }

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
            '1 2 3 4 5 6 7 8 9 0',
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
              '1 2 3 4 5 6 7 8 9 0 Q W E R T Y U I O P A S D F G H J K L Ñ Z X C V B N M {bksp} {enter} {space}',
          },
        ],
      };

      this.keyboard = new Keyboard(keyboardOptions);

      // Apply styles to the buttons
      const buttons = keyboardElement.querySelectorAll('.hg-button');
      buttons.forEach((button) => {
        const htmlButton = button as HTMLElement;
        htmlButton.style.fontSize = '90px';
        htmlButton.style.height = '150px';
        htmlButton.style.lineHeight = '120px';
        htmlButton.style.background = 'rgba(255, 255, 255, 0.7)'; // Semi-transparent background
      });

      // Center and style the keyboard
      const keyboardElementStyle = keyboardElement as HTMLElement;
      keyboardElementStyle.style.position = 'fixed';
      keyboardElementStyle.style.top = '52%';
      keyboardElementStyle.style.left = '50%';
      keyboardElementStyle.style.transform = 'translate(-50%, 100%)'; // Center keyboard
      keyboardElementStyle.style.width = '100%';
      keyboardElementStyle.style.height = '810px';
      keyboardElementStyle.style.background = 'rgba(255, 255, 255, 0.5)';
      keyboardElementStyle.style.zIndex = '1000';
      keyboardElementStyle.style.borderRadius = '10px';
      keyboardElementStyle.style.padding = '20px';
      keyboardElementStyle.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }
  }


  onInputChange(input: string): void {
    this.searchQuery = input;
    this.search(this.searchQuery)
  }

  onKeyPress(button: string): void {
    if (button === '{enter}') {
      this.closeVirtualKeyboard();
    }
    
    if (button === '{bksp}') {
      this.searchQuery = this.searchQuery.slice(0, -1); // Elimina el último carácter del campo de texto
    }
  }
  
  loadMaps() {
    this.mapsService.getAllMaps().subscribe({
      next: (response) => {
        this.maps = response.maps;
        this.updateMap();
      },
      error: (error) => {
        console.error('Error al cargar mapas:', error);
      },
    });
  }

  updateMap() {
    if (isPlatformBrowser(this.platformId)) {
    // Access the selected building
    const buildingMaps = this.maps[this.selectedBuilding];

    if (buildingMaps) {
      // Construct the floor key (e.g., 'Piso 2')
      const floorKey = `Piso ${this.selectedFloor}`;

      // Access the map for the selected floor
      const floorMaps = buildingMaps[floorKey];

      if (floorMaps && floorMaps.length > 0) {
        // Use the first available map for that floor
        this.currentMap = floorMaps[0];

        // Build the URL for the map image
        this.mapImageUrl = `https://totemvespucio.cl/assets/mapas/${this.currentMap.image_path}`;

        // Load the map image and after it has loaded, load the points of interest
        this.loadMapImage();
      } else {
        // If no maps are available for the selected floor
        this.currentMap = null;
        this.mapImageUrl = '';
        this.currentPoints = [];
        this.filteredPoints = [];
      }
    } else {
      // If the selected building does not exist in the maps data
      this.currentMap = null;
      this.mapImageUrl = '';
      this.currentPoints = [];
      this.filteredPoints = [];
    }
  }
  }

  loadMapImage() {
    const img = new Image();
    img.src = this.mapImageUrl;
    img.onload = () => {
      // Adjust image dimensions
      this.adjustImageDimensions(img);
      // Update SVG size
      this.updateSvgSize();

      // Now load the points of interest
      this.loadPointsOfInterest();
    };
    img.onerror = (error) => {
      console.error('Error al cargar la imagen del mapa:', error);
    };
  }
  originalWidth:number=1000;
  originalHeight:number=1000;
 
  // Función ajustada de adjustImageDimensions
  adjustImageDimensions(img: HTMLImageElement) {
    const maxDimension = 1000; // Máximo permitido para ancho o alto

    // Almacenar dimensiones originales
    this.originalWidth = img.naturalWidth;
    this.originalHeight = img.naturalHeight;

    // Calcular relación de aspecto
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Ajustar dimensiones manteniendo la relación de aspecto
    if (img.naturalWidth > img.naturalHeight) {
      this.imageWidth = Math.min(img.naturalWidth, maxDimension);
      this.imageHeight = this.imageWidth / aspectRatio;
    } else {
      this.imageHeight = Math.min(img.naturalHeight, maxDimension);
      this.imageWidth = this.imageHeight * aspectRatio;
    }
  }

  updateSvgSize() {
    this.svgWidth = this.imageWidth;
    this.svgHeight = this.imageHeight;
  }

  loadPointsOfInterest() {
    this.mapsService.getAllPointsOfInterest().subscribe({
      next: (response) => {
        if (response.success) {
          // Process the points of interest
          this.pointsOfInterest = response.pointsOfInterest.map((point: any) => {
            const iconName = point.PointIcon?.point_icon_image_path || '';
            this.isPulseActive = false;
            this.highlightedPoint = null;
            return {
              id: point.id_point_of_interest,
              x: point.coordinates.coordinates[0],
              y: point.coordinates.coordinates[1],
              point_name: point.point_name,
              width: point.width,
              height: point.height,
              color: point.color,
              categoryId: point.categoryId,
              iconId: point.id_point_icon,
              iconName: iconName,
              mapId: point.id_map,
              relatedId: point.id_map_conexion || point.id_info || null,
              originalWidth: point.width,
              originalHeight: point.height,
              isEnlarged: false,
            };
          });

          // Filter the points of interest for the current map
          const mapId = this.currentMap.id_map;
          this.currentPoints = this.pointsOfInterest
            .filter((point) => point.mapId === mapId)
            .sort((a, b) => b.categoryId - a.categoryId); // Ordenar por categoría de menor a mayor
          
            this.resetPOIVisuals();
        // **Filtrar los puntos de categoría 1 que pertenecen al mapa actual y tienen un título**
        this.pointsLeyend = this.pointsOfInterest.filter(
          (point) => 
            point.categoryId === 1 &&  // Categoría 1
            point.mapId === mapId &&   // Mismo mapa actual
            point.point_name.trim() !== '' // Tienen un título definido
        );


          // Update filteredPoints to show all points on the current map
          this.filteredPoints = [...this.currentPoints];

          // Register the map change
          this.registerClick(
            'maps',
            'map_change',
            `${this.selectedBuilding} Piso ${this.selectedFloor}`
          );
        } else {
          console.error('Error al cargar puntos de interés:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al cargar puntos de interés:', error);
      },
    });
  }

  // Get the list of floors for the selected building
  getFloors(building: string): number[] {
    if (building === 'Edificio Boulevard') {
      return [1, 2, 3];
    } else if (building === 'Sede Principal') {
      return [1, 5, 6, 7];
    }
    return [];
  }

  // Handle building and floor selection from buttons
  selectFloor(building: string, floor: number) {
    this.selectedBuilding = building;
    this.selectedFloor = floor;
    this.updateMap();
  }

  // Handle panning events
  onMouseDown(event: MouseEvent) {
    this.isPanning = true;
    this.panNowX = event.clientX;
    this.panNowY = event.clientY;
    event.preventDefault();
  }

  panNowX:number=0;
  panNowY:number=0;

  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const deltaX = event.clientX - this.panNowX;
    const deltaY = event.clientY - this.panNowY;

    this.panNowX = event.clientX;
    this.panNowY = event.clientY;

    this.panOffsetX += deltaX;
    this.panOffsetY += deltaY;

    this.constrainPanOffsets();
    }
  }
  constrainPanOffsets() {
    const maxPanX = -this.svgWidth * (this.zoomLevel / 100) + this.svgWidth;
    const maxPanY = -this.svgHeight * (this.zoomLevel / 100) + this.svgHeight;

    this.panOffsetX = Math.min(0, Math.max(this.panOffsetX, maxPanX));
    this.panOffsetY = Math.min(0, Math.max(this.panOffsetY, maxPanY));
  }
  
  onWheel(event: WheelEvent) {
    if (!event.ctrlKey) {
      return; // Si no se presiona Ctrl, no hacemos nada
    }
  
    event.preventDefault(); 
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // Posición del mouse relativa al contenedor
    const mouseY = event.clientY - rect.top;
  
    const zoomDelta = event.deltaY > 0 ? -10 : 10;
    const newZoomLevel = Math.min(Math.max(this.zoomLevel + zoomDelta, 100), 200);
  
    const zoomFactor = newZoomLevel / this.zoomLevel;
  
    // Ajustar los offsets para centrar el zoom en la posición del mouse
    this.panOffsetX = mouseX - (mouseX - this.panOffsetX) * zoomFactor;
    this.panOffsetY = mouseY - (mouseY - this.panOffsetY) * zoomFactor;
  
    this.zoomLevel = newZoomLevel;
  
    // Restringir después del zoom
    this.constrainPanOffsets();
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-container')) {
      this.filteredSuggestions = [];
    }
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic dentro de la barra cierre las sugerencias
  }
  exZoomLevel:number = 1;
  applyZoomChange(newZoomLevel: number) {
    const zoomFactor = newZoomLevel / this.exZoomLevel || 1;
    this.exZoomLevel = newZoomLevel;
  
    const viewportCenterX = (this.svgWidth / 2 - this.panOffsetX) * zoomFactor;
    const viewportCenterY = (this.svgHeight / 2 - this.panOffsetY) * zoomFactor;
  
    this.panOffsetX = this.svgWidth / 2 - viewportCenterX;
    this.panOffsetY = this.svgHeight / 2 - viewportCenterY;
  
    this.constrainPanOffsets(); // Asegurar los límites de panning
  }
  

  onMouseUp(event: MouseEvent) {
    this.isPanning = false;
  }

  onMouseLeave(event: MouseEvent) {
    this.isPanning = false;
  }
 

  // Handle click on points of interest
  onPOIClick(poi: POI) {
    if (poi.categoryId === 4 && poi.relatedId) {
      
        this.navigateToMap(poi.relatedId);
      return;
    } 
    
    if(poi.categoryId === 1){
      // Si el POI ya está agrandado, achicarlo
 
        if (poi.isEnlarged) {
          this.resetPOIVisuals();
 
        } else {
          this.registerClick("maps","point of interest",poi.point_name);
          this.highlightPOI(poi,1000)
          // Restablecer todos los POIs antes de agrandar el nuevo
          this.resetPOIVisuals();
              // Mostrar la burbuja con el título
          this.selectedBubbleTitle = poi.point_name;
 
          // Calcular el tamaño y posición de la burbuja
          const textLength = poi.point_name.length;
          this.selectedBubbleWidth = Math.max(60, textLength * 9);
          this.selectedBubbleHeight = 30;
          this.selectedBubbleX = poi.x - this.selectedBubbleWidth / 2;
          this.selectedBubbleY = poi.y - poi.height * 1.2 / 2 - this.selectedBubbleHeight - this.selectedBubbleTailHeight;
          // Agrandar el POI seleccionado
          poi.width = poi.originalWidth * 1.2;
          poi.height = poi.originalHeight * 1.2;
          poi.isEnlarged = true;
          this.selectedPOIId = poi.id;
        }
      }
      if(poi.categoryId === 3){
        this.highlightSquarePOI(poi);
        this.registerClick("maps","point of interest",poi.point_name);
      }
  }
  isActiveFloor(building: string, floor: number): boolean {
    return this.selectedBuilding === building && this.selectedFloor === floor;
  }
  
  // Propiedad temporal para almacenar el tamaño original del POI
  selectedBubbleTitle: string | null = null; // Título de la burbuja
  selectedBubbleX: number = 0; // Posición X de la burbuja
  selectedBubbleY: number = 0; // Posición Y de la burbuja
  selectedBubbleWidth: number = 0; // Ancho dinámico de la burbuja
  selectedBubbleHeight: number = 30; // Altura fija de la burbuja
  selectedBubbleTailHeight: number = 10; // Altura de la cola de la burbuja
  selectedPOIId: number | null = null; // ID del POI actualmente ampliado
  resetPOIVisuals() {
    this.pointsOfInterest.forEach(poi => {
      if (poi.isEnlarged) {
        poi.width = poi.originalWidth;
        poi.height = poi.originalHeight;
        poi.isEnlarged = false;
      }
    });
    this.selectedPOIId = null; // Limpiar el POI seleccionado
    this.selectedBubbleTitle = null;   // Ocultar el título
    this.bubbleTitle = null; // Ocultar el título  
  }
  // Handle search input with debounce
  search(query: string): void {
    this.searchQuery = query;

    // Clear any existing debounce timer
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set a new debounce timer
    this.searchTimeout = setTimeout(() => {
      this.executeSearch(query);
    }, 500); // Waits 0.5 seconds after the user stops typing
  }

  // Execute the search and update suggestions and filtered points
  private executeSearch(query: string): void {
    const normalizedQuery = this.removeAccents(query.toLowerCase());
    
    this.filteredSuggestions = this.pointsOfInterest
    .filter((point, index, self) => 
      (point.categoryId === 1 || point.categoryId === 3) && 
      point.point_name.trim() !== '' &&
      this.removeAccents(point.point_name.toUpperCase()).includes(normalizedQuery.toUpperCase()) &&
      index === self.findIndex(p => 
        this.removeAccents(p.point_name.toUpperCase()) === this.removeAccents(point.point_name.toUpperCase())
      ) // Retiene solo la primera ocurrencia del nombre único en mayúsculas
    );
  
    
    // Limit suggestions to 10 items
    this.filteredSuggestions = this.filteredSuggestions.slice(0, 10);

    // Only register search log if query is not empty
    if (query.trim() !== '') {
      // Register search log
      this.registerSearch('maps', 'search', query);
    }

   
  }

  goToPOI(query: string) {
    this.registerSearch('maps', 'search', query);
    // Filtra todos los puntos que coinciden con el nombre
    const matchingPoints = this.pointsOfInterest.filter(
      (point) =>
        this.removeAccents(point.point_name.toUpperCase()) === this.removeAccents(query.toUpperCase())
    );
  
    if (matchingPoints.length === 0) {
      return;
    }
  
    // Ordena los puntos según la prioridad
    const sortedPoints = this.prioritizePoints(matchingPoints);
  
    const recommendedPOI = sortedPoints[0]; // El primer punto es el más recomendado
  
    if (recommendedPOI.mapId === this.currentMap.id_map) {
      // Centra en el punto si está en el mismo mapa
       this.zoomLevel =100;
       this.constrainPanOffsets();
    } else {
      this.zoomLevel =100;
      this.constrainPanOffsets();
      // Cambia de mapa y navega al punto
      this.navigateToMap(recommendedPOI.mapId);
    }
  
    // Espera medio segundo y llama a legendMethod si es categoría 1
    if (recommendedPOI.categoryId === 1) {
      setTimeout(() => {
        this.legendMethod(recommendedPOI);
      }, 500);
    }
    if (recommendedPOI.categoryId === 3) {
      setTimeout(() => {
        this.highlightSquarePOI(recommendedPOI);
      }, 500);
    }
    // Limpia el buscador
    this.searchQuery = '';
    this.filteredSuggestions = [];
  }


  // Método para ordenar puntos por prioridad
  prioritizePoints(points: POI[]): POI[] {
    return points.sort((a, b) => {
      if (a.mapId === this.currentMap.id_map) return -1; // Prioridad 1: Mismo mapa
      if (b.mapId === this.currentMap.id_map) return 1;
  
      const aBuilding = this.mapIdToBuildingAndFloor[a.mapId]?.building;
      const bBuilding = this.mapIdToBuildingAndFloor[b.mapId]?.building;
  
      const aFloor = this.mapIdToBuildingAndFloor[a.mapId]?.floor;
      const bFloor = this.mapIdToBuildingAndFloor[b.mapId]?.floor;
  
      if (aBuilding === this.selectedBuilding && bBuilding === this.selectedBuilding) {
        // Prioridad 2 y 3: Mismo edificio, comparar pisos
        return Math.abs(aFloor - this.selectedFloor) - Math.abs(bFloor - this.selectedFloor);
      }
  
      if (aBuilding === this.selectedBuilding) return -1; // Prioridad 4: Mismo edificio, diferente piso
      if (bBuilding === this.selectedBuilding) return 1;
  
      return aFloor - bFloor; // Prioridad 5: Otro edificio, primer piso más cercano
    });
  }
  
  
  navigateToMap(mapId: number) {
    const target = this.mapIdToBuildingAndFloor[mapId];
    if (target) {
      this.selectedBuilding = target.building;
      this.selectedFloor = target.floor;
      this.updateMap();
    } else {
      alert('No se encontró el mapa para este punto de interés.');
    }
  }

  // Mouse enter and leave events for POIs
  onMouseEnterPOI(poi: POI) {
    if (poi.categoryId === 1 && !poi.isEnlarged) {
      // Show the bubble with the title
      this.bubbleTitle = poi.point_name;

      // Calculate the size and position of the bubble
      const textLength = poi.point_name.length;
      this.bubbleWidth = Math.max(60, textLength * 9);
      this.bubbleHeight = 30;
      this.bubbleX = poi.x - this.bubbleWidth / 2;
      this.bubbleY =
        poi.y - poi.height * 1.2 / 2 - this.bubbleHeight - this.bubbleTailHeight;

      // Enlarge the POI
      poi.width = poi.originalWidth * 1.2;
      poi.height = poi.originalHeight * 1.2;
    }
  }

  onMouseLeavePOI(poi: POI) {
    if (poi.categoryId === 1 && !poi.isEnlarged) {
      // Hide the bubble
      this.bubbleTitle = null;

      // Restore the original size
      poi.width = poi.originalWidth;
      poi.height = poi.originalHeight;
 
    }
  }

  getBubbleTailPoints(
    centerX: number,
    bottomY: number,
    tailHeight: number
  ): string {
    const tailWidth = 10; // Width of the tail

    return `
      ${centerX - tailWidth / 2},${bottomY}  
      ${centerX + tailWidth / 2},${bottomY}  
      ${centerX},${bottomY + tailHeight}    
    `;
  }

  // Utility function to remove accents from strings
  private removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }


// index-map.component.ts
highlightedPoint: { x: number; y: number } | null = null;
highlightedRadius: number = 10; // Radio inicial de la onda
isPulseActive: boolean = false; // Estado para controlar la animación


legendMethod(poi:POI):void {
  if(!poi.isEnlarged)
  this.onPOIClick(poi);
  this.highlightPOI(poi,5000)
}

highlightPOI(legend: POI, duration: number): void {
  // Encuentra el punto en el mapa que coincide con el nombre de la leyenda
  const point = this.filteredPoints.find(poi => poi.point_name === legend.point_name);

  // Si hay un temporizador activo, cancelarlo
  if (this.pulseTimeout) {
    clearTimeout(this.pulseTimeout);
    this.isPulseActive = false;
    this.highlightedPoint = null;
  }

  if (point) {
    this.highlightedPoint = { x: point.x, y: point.y };
    this.isPulseActive = true;

    // Establecer un nuevo temporizador para detener el efecto después de la duración especificada
    this.pulseTimeout = setTimeout(() => {
      this.isPulseActive = false;
      this.highlightedPoint = null;
    }, duration);
  }
}
highlightedSquarePoint: POI | null = null;
isSquareHighlightActive: boolean = false;
squareHighlightTimeout: any = null;
highlightSquarePOI(poi: POI): void {
  // Verifica si hay un POI destacado actualmente y lo desactiva
  if (this.squareHighlightTimeout) {
    clearTimeout(this.squareHighlightTimeout);
  }

  // Define el POI seleccionado como el actual
  this.highlightedSquarePoint = poi;
  this.isSquareHighlightActive = true;

  // Detiene la animación después de 3 segundos
  this.squareHighlightTimeout = setTimeout(() => {
    this.isSquareHighlightActive = false;
    this.highlightedSquarePoint = null;
  }, 3000);
}
// Definición de la propiedad pulseTimeout
private pulseTimeout: any = null;



  /**
   * Registers a click event log.
   * @param component The component where the click occurred.
   * @param selection The type of selection made.
   * @param logCategoryDetails Additional details about the selection.
   */
  private registerClick(
    component: string,
    selection: string,
    logCategoryDetails: string
  ): void {
    this.globalService
      .addClickLog(component, selection, logCategoryDetails)
      .subscribe({
        next: (response: any) => {
          // Click log registered successfully
        },
        error: (error: any) => {
          console.error('Error al registrar el click log:', error);
        },
      });
  }

  /**
   * Registers a search event log.
   * @param component The component where the search occurred.
   * @param selection The type of selection made.
   * @param logCategoryDetails Additional details about the search.
   */
  private registerSearch(
    component: string,
    selection: string,
    logCategoryDetails: string
  ): void {
    this.globalService
      .addSearchLog(component, selection, logCategoryDetails)
      .subscribe({
        next: (response: any) => {
          // Search log registered successfully
        },
        error: (error: any) => {
          console.error('Error al registrar el search log:', error);
        },
      });
  }
}
