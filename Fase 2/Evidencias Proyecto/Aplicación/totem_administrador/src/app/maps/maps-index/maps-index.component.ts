// **Importaciones de Angular Core**
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// **Importaciones de Servicios**
import { MapsService } from '../services/maps.service';

// **Definición de la Interfaz para Puntos de Interés (POI)**
interface POI {
  id: number;  
  categoryId: number;
  x: number;
  y: number;
  title: string;
  relatedId: number | null;
  iconId: number;
  iconName: string; // Nombre del icono de Material Icons
  width: number;
  height: number;
  color: string;
  mapId: number;
  originalWidth: number; // Ancho original
  originalHeight: number; // Alto original
  isEnlarged: boolean; // Indica si el POI está agrandado
}

@Component({
  selector: 'app-maps-index',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './maps-index.component.html',
  styleUrls: ['./maps-index.component.css']
})
export class MapsIndexComponent implements OnInit {

  // ==========================
  // **INICIO: Carga Inicial y Llamados**
  // ==========================

  // **Propiedades de Datos del Mapa**
  id: number | null = null; // ID del mapa actual
  mapImageUrl: string = ''; // URL de la imagen del mapa

  // **Categorías de Puntos y Material Icons**

  materialIcons: any[] = []; // Iconos de Material Icons obtenidos del servicio
  informations:any[] = []; // Información de las categorías

  // **Constructor**
  constructor(
    private route: ActivatedRoute,
    private mapsService: MapsService,
    private router: Router
  ) {
  }

  // **Método de Inicialización del Componente**
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.id= null; // ID del mapa actual
    this.mapImageUrl= ''; // URL de la imagen del mapa
    this.loadMapData();
    if (this.materialIcons.length === 0) {
      this.loadMaterialIcons(); // Cargar iconos de Material Icons
    }
    if (this.informations.length === 0) {
      this.loadCategories(); // Cargar categorías
    }
    this.loadPointsOfInterest(); // Cargar puntos de interés
  }

  // **Cargar datos del mapa**
  loadMapData() {
    this.id = Number(this.route.snapshot.paramMap.get('id_map'));
    if (this.id !== null) {
      this.mapsService.getMapById(this.id).subscribe({
        next: (mapData) => {
          this.mapImageUrl = `https://totemvespucio.cl/assets/mapas/${mapData.map.image_path}`;
          this.loadMapImage();
        },
        error: (error) => {
          console.error('Error al obtener el mapa:', error);
        }
      });
    }
  }

  loadPointsOfInterest() {
    this.mapsService.getAllPointsOfInterest().subscribe({
        next: (response) => {
            if (response.success) {
                console.log('Puntos de interés cargados:', response.points);
                
                // Filtrar los puntos de interés por el mapa actual y ordenar por categoría ascendente
                this.pois = response.points
                    .filter((point: any) => point.id_map === this.id) // Filtrar por id_map que coincida con this.id
                    .map((point: any) => ({
                        id: point.id_point_of_interest,
                        categoryId: point.categoryId,
                        x: point.coordinates.coordinates[0], // Asumiendo que coordinates es un objeto GeoJSON
                        y: point.coordinates.coordinates[1],
                        title: point.point_name,
                        relatedId: point.id_map_conexion || point.id_info || null,
                        iconName: point.categoryId === 1 ? point.PointIcon.point_icon_image_path : null, // Mapea el icono según sea necesario
                        iconId: point.id_point_icon,
                        width: point.width,
                        height: point.height,
                        color: point.color,
                        mapId: point.id_map,
                        originalWidth: point.width,
                        originalHeight: point.height,
                        isEnlarged: false, // Inicialmente no agrandado
                    }))
                    .sort((a:POI, b:POI) => b.categoryId-a.categoryId); // Ordenar por categoryId ascendente
            } else {
                console.error('Error al cargar puntos de interés:', response.message);
            }
        },
        error: (error) => {
            console.error('Error al obtener puntos de interés:', error);
        }
    });
}


  
  // **Cargar Material Icons para Categoría 1 y 2**
  loadMaterialIcons() {
    this.mapsService.getAllPointIcons().subscribe({
      next: (icon) => {
        this.materialIcons = icon.icons;
      },
      error: (error) => {
        console.error('Error al obtener los tipos de puntos:', error);
      }
    });
  }

  // Método para cargar categorías
  loadCategories() {
    this.mapsService.getInformationsCategorie().subscribe(
      (response: any) => {
        // Procesar categorías y mapear edificios
        this.informations = response.informations;
      },
      (error: any) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }
  // ==========================
  // **GRID, IMAGEN Y SVG**
  // ==========================

  // **Propiedades de la Imagen y SVG**
  imageWidth: number = 0; // Ancho de la imagen del mapa
  imageHeight: number = 0; // Alto de la imagen del mapa
  svgWidth: number = 1024; // Ancho del SVG
  svgHeight: number = 1024; // Alto del SVG

  // **Propiedades de la Grilla**
  isGridVisible: boolean = true; // Grilla visible por defecto
  gridSpacing: number = 5; // Espaciado de la grilla
  gridLinesX: number[] = []; // Líneas de grilla en X
  gridLinesY: number[] = []; // Líneas de grilla en Y

  // **Cargar imagen del mapa y ajustar dimensiones**
  loadMapImage() {
    const img = new Image();
    img.src = this.mapImageUrl;
    img.onload = () => {
      this.adjustImageDimensions(img);
      this.updateSvgSize();
      this.generateGridLines();
    };
  }

  adjustImageDimensions(img: HTMLImageElement) {
    const maxDimension = 1000; // Máximo permitido para ancho o alto

    // Calcula la relación de aspecto
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Ajustar dimensiones manteniendo la relación de aspecto
    if (img.naturalWidth > img.naturalHeight) {
        this.imageWidth = Math.min(img.naturalWidth, maxDimension);
        this.imageHeight = this.imageWidth / aspectRatio;
    } else {
        this.imageHeight = Math.min(img.naturalHeight, maxDimension);
        this.imageWidth = this.imageHeight * aspectRatio;
    }

    this.calculateGridSpacing();
    this.alignImageDimensionsToGrid();
}


  // **Calcular el espaciado de la grilla basado en el tamaño del SVG**
  calculateGridSpacing() {
    const gridSpacing =
      Math.min(this.svgWidth, this.svgHeight) < 1000
        ? Math.round((Math.min(this.svgWidth, this.svgHeight) / 1000) * 10)
        : 10;
    this.gridSpacing = gridSpacing / 2;
  }

  // **Alinear dimensiones de la imagen a la grilla**
  alignImageDimensionsToGrid() {
    if (this.imageHeight % this.gridSpacing !== 0) {
      this.imageHeight =
        Math.floor(this.imageHeight / this.gridSpacing) * this.gridSpacing;
    }
    if (this.imageWidth % this.gridSpacing !== 0) {
      this.imageWidth =
        Math.floor(this.imageWidth / this.gridSpacing) * this.gridSpacing;
    }
  }

  // **Actualizar el tamaño del SVG basado en las dimensiones de la imagen**
  updateSvgSize() {
    this.svgWidth = this.imageWidth;
    this.svgHeight = this.imageHeight;
  }

  // **Generar líneas de la grilla para el SVG**
  generateGridLines() {
    this.gridLinesX = this.generateGridLinesArray(this.svgWidth);
    this.gridLinesY = this.generateGridLinesArray(this.svgHeight);
  }

  // **Generar arreglo de líneas de grilla basado en la dimensión proporcionada**
  generateGridLinesArray(dimension: number): number[] {
    const lines: number[] = [];
    for (let i = 0; i <= dimension; i += this.gridSpacing) {
      lines.push(i);
    }
    return lines;
  }

  // **Alternar visibilidad de la grilla**
  toggleGrid() {
    this.isGridVisible = !this.isGridVisible;
  }

  // ==========================
  // **BOTONES MODOS Y EVENTOS DE MOUSE**
  // ==========================

  // **Modos de Interacción**
  isCreatingPOI: boolean = false; // Modo crear
  isEditMode: boolean = false; // Modo editar
  isDeleteMode: boolean = false; // Modo eliminar
  isClickPanning: boolean = false; // Modo manita (panning)

  idEditPOI: number | null = null;  // Almacena el ID del POI en edición
  selectedPOIId: number | null = null; // ID del POI actualmente ampliado
  isAlargedPOI: boolean = false; // Indica si un POI está ampliado

  // **Propiedades para Dibujar Áreas**
  isAlignmentActive: boolean = true; // Alineación a la grilla

  // **Propiedades para Dibujar Áreas**
  isDrawingArea: boolean = false; // Indica si se está dibujando un área
  isPanning: boolean = false; // Indica si se está haciendo pan (arrastrar)

  isMouseOver: boolean = false; // Indica si el mouse está sobre el SVG

  // Propiedad temporal para almacenar el tamaño original del POI
  bubbleTitle: string | null = null; // Título de la burbuja
  bubbleX: number = 0; // Posición X de la burbuja
  bubbleY: number = 0; // Posición Y de la burbuja
  bubbleWidth: number = 0; // Ancho dinámico de la burbuja
  bubbleHeight: number = 30; // Altura fija de la burbuja
  bubbleTailHeight: number = 10; // Altura de la cola de la burbuja

  // Propiedad temporal para almacenar el tamaño original del POI
  selectedBubbleTitle: string | null = null; // Título de la burbuja
  selectedBubbleX: number = 0; // Posición X de la burbuja
  selectedBubbleY: number = 0; // Posición Y de la burbuja
  selectedBubbleWidth: number = 0; // Ancho dinámico de la burbuja
  selectedBubbleHeight: number = 30; // Altura fija de la burbuja
  selectedBubbleTailHeight: number = 10; // Altura de la cola de la burbuja
  
  // **Propiedades para Carga de Imágenes**
  selectedFile: File | null = null; // Archivo seleccionado para la imagen
  previewUrl: string | null = null; // URL de vista previa de la imagen
  isUploadModalOpen: boolean = false; // Estado del modal de carga

  // **Activar modo de creación de POI**
  activatePOICreation() {
    const wasActive = this.isCreatingPOI;
    this.deactivateAllModes();
    this.isCreatingPOI = !wasActive;
  }

  // **Activar modo de edición**
  activateEditMode() {
    const wasActive = this.isEditMode;
    this.deactivateAllModes();
    this.isEditMode = !wasActive;
  }

  // **Activar modo de eliminación**
  activateDeleteMode() {
    const wasActive = this.isDeleteMode;
    this.deactivateAllModes();
    this.isDeleteMode = !wasActive;
  }

  // **Activar modo manita (panning)**
  togglePanning() {
    const wasActive = this.isClickPanning;
    this.deactivateAllModes();
    this.isClickPanning = !wasActive;
  }

  // **Desactivar todos los modos activos**
  deactivateAllModes() {
    this.isCreatingPOI = false;
    this.isEditMode = false;
    this.isDeleteMode = false;
    this.isClickPanning = false;
  }

  // **Alternar alineación a la grilla**
  toggleAlignment() {
    this.isAlignmentActive = !this.isAlignmentActive;
  }

  // **Alinear coordenada a la grilla si está activada la alineación**
  alignCoordinate(coordinate: number): number {
    return this.isAlignmentActive ? this.roundToGrid(coordinate) + 2 : coordinate;
  }

  // **Redondear un valor al punto más cercano de la grilla**
  roundToGrid(value: number): number {
    return Math.round(value / this.gridSpacing) * this.gridSpacing - 2;
  }

  // **Eventos de Mouse**
  onMouseDown(event: MouseEvent) {
    if (event.button === 1) { // Botón central del mouse
      this.startPanning(event);
    } else if (event.button === 0) { // Botón izquierdo del mouse
      if (this.isClickPanning) {
        this.startPanning(event);
      } else if (this.isCreatingPOI) {
        this.handlePOICreation(event);
      } else {
        // Restablecer cualquier POI seleccionado si se hace clic fuera de un POI
        this.resetPOIVisuals();
      }
    }
  }
  

  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.performPanning(event);
    }
    
    if (this.selectedCategoryId == 1 && this.isCreatingPOI) {
      const { adjustedX, adjustedY } = this.getAdjustedCoordinates(event);
      
      // Actualiza las coordenadas y tamaño para previsualización
      this.hoveredIcon = {
        x: adjustedX,  // Coordenadas crudas desde el centro
        y: adjustedY,
        iconName: this.selectedIconName,
      };
    }
  
    if ((this.selectedCategoryId == 3 || this.selectedCategoryId == 4) && this.isCreatingPOI) {
      this.updateAreaDrawing(event);
    }
  }
  

  onMouseLeave(event: MouseEvent) { 
    this.isMouseOver = false;
    if (this.isCreatingPOI && this.selectedCategoryId == 1) {
      this.hoveredIcon = null;
    }
  }

  onMouseEnter(event: MouseEvent) { 
    this.isMouseOver = true;
  }

  onMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
    }
  }

  onMouseEnterPOI(poi: POI) {
    if (poi.categoryId === 1 && !poi.isEnlarged) {
      // Mostrar la burbuja con el título
      this.bubbleTitle = poi.title;
  
      // Calcular el tamaño y posición de la burbuja
      const textLength = poi.title.length;
      this.bubbleWidth = Math.max(60, textLength * 9);
      this.bubbleHeight = 30;
      this.bubbleX = poi.x - this.bubbleWidth / 2;
      this.bubbleY = poi.y - poi.height * 1.2 / 2 - this.bubbleHeight - this.bubbleTailHeight;
  
      // Solo ampliar temporalmente si no está ya agrandado por clic
      poi.width = poi.originalWidth * 1.2;
      poi.height = poi.originalHeight * 1.2;
      poi.isEnlarged = true;
    }
  }
  
  onMouseLeavePOI(poi: POI) {
  if (poi.categoryId === 1 && poi.isEnlarged && poi.id !== this.selectedPOIId) {
    // Ocultar la burbuja del título
    this.bubbleTitle = null;

    // Restaurar el tamaño original si no está permanentemente agrandado
    poi.width = poi.originalWidth;
    poi.height = poi.originalHeight;
    poi.isEnlarged = false;
  }
}


  getBubbleTailPoints(centerX: number, bottomY: number, tailHeight: number): string {
    const tailWidth = 10; // Ancho de la cola
  
    return `
      ${centerX - tailWidth / 2},${bottomY}  
      ${centerX + tailWidth / 2},${bottomY}  
      ${centerX},${bottomY + tailHeight}    
    `;
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    if (this.isCreatingPOI) {
      this.tempPOI = null;
      this.isDrawingArea = false;
    }
  }
 // Abrir modal de carga
 openUploadModal() {
  this.isUploadModalOpen = true;
}

// Cerrar modal de carga
closeUploadModal() {
  this.isUploadModalOpen = false;
  this.selectedFileName='';
  this.selectedFile = null;
  this.previewUrl = null;
}

// Método para manejar la selección de archivo
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.selectedFileName = file.name; // Obtiene el nombre del archivo seleccionado

    const reader = new FileReader();
    reader.onload = (e: any) => this.previewUrl = e.target.result;
    reader.readAsDataURL(file);
  } else {
    this.selectedFileName = ''; // Si no hay archivo seleccionado, limpiar el nombre
    this.previewUrl = null; // También limpiar la vista previa
  }
}
selectedFileName: string = '';    // Nombre del archivo seleccionado

// Subir la imagen al servidor
uploadImage() {
  if (this.selectedFile && this.id) {
    this.mapsService.uploadMapImage(this.id, this.selectedFile).subscribe(
      (response: any) => {
        this.closeUploadModal();
        this.loadData(); // Recarga los datos del mapa actual
      },
      (error: any) => {
        console.error('Error al subir la imagen:', error);
      }
    );
  }
}
  // ==========================
  // **DESPLAZAMIENTO Y ZOOM**
  // ==========================

  // **Propiedades de Desplazamiento y Zoom**

  panOffsetX: number = 0; // Offset de desplazamiento en X
  panOffsetY: number = 0; // Offset de desplazamiento en Y
  panNowX: number = 0; // Posición actual de pan en X
  panNowY: number = 0; // Posición actual de pan en Y
  zoomLevel: number = 100; // Nivel de zoom inicial
  exZoomLevel: number = 100; // Nivel de zoom anterior

  // **Iniciar desplazamiento (panning)**
  startPanning(event: MouseEvent) {
    this.isPanning = true;
    this.panNowX = event.clientX;
    this.panNowY = event.clientY;
    event.preventDefault();
  }

  // **Realizar desplazamiento (panning)**
  performPanning(event: MouseEvent) {
    const deltaX = event.clientX - this.panNowX;
    const deltaY = event.clientY - this.panNowY;

    this.panNowX = event.clientX;
    this.panNowY = event.clientY;

    this.panOffsetX += deltaX;
    this.panOffsetY += deltaY;

    this.constrainPanOffsets();
  }

  // **Restringir los offsets de panning dentro de los límites**
  constrainPanOffsets() {
    const maxPanX = -this.svgWidth * (this.zoomLevel / 100) + this.svgWidth;
    const maxPanY = -this.svgHeight * (this.zoomLevel / 100) + this.svgHeight;

    this.panOffsetX = Math.min(0, Math.max(this.panOffsetX, maxPanX));
    this.panOffsetY = Math.min(0, Math.max(this.panOffsetY, maxPanY));
  }

  // **Manejar cambios en el nivel de zoom desde el input**
  onZoomChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newZoomLevel = Number(target.value);
    this.applyZoomChange(newZoomLevel);
  }

  // **Manejar eventos de rueda del mouse para zoom**
  onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomDelta = event.deltaY > 0 ? -10 : 10;
    const newZoomLevel = Math.min(Math.max(this.zoomLevel + zoomDelta, 100), 500);
    this.zoomLevel = newZoomLevel;

    this.applyZoomChange(newZoomLevel);
  }

  // **Aplicar cambios de zoom y ajustar pan en consecuencia**
  applyZoomChange(newZoomLevel: number) {
    const zoomFactor = newZoomLevel / this.exZoomLevel || 1;
    this.exZoomLevel = newZoomLevel;

    const viewportCenterX = (this.svgWidth / 2 - this.panOffsetX) * zoomFactor;
    const viewportCenterY = (this.svgHeight / 2 - this.panOffsetY) * zoomFactor;

    this.panOffsetX = this.svgWidth / 2 - viewportCenterX;
    this.panOffsetY = this.svgHeight / 2 - viewportCenterY;

    this.constrainPanOffsets();
  }

  // **Obtener coordenadas ajustadas considerando pan y zoom**
  getAdjustedCoordinates(event: MouseEvent): { adjustedX: number; adjustedY: number } {
    const adjustedX = (event.offsetX - this.panOffsetX) / (this.zoomLevel / 100);
    const adjustedY = (event.offsetY - this.panOffsetY) / (this.zoomLevel / 100);
    return { adjustedX, adjustedY };
  }

  // ==========================
  // **SECCIÓN COMÚN INICIAL**
  // ==========================

  // **Lista de Puntos de Interés**
  pois: POI[] = []; // Arreglo genérico de POIs

  // **Categoría seleccionada por el usuario**
  selectedCategoryId: number = 1; // Categoría seleccionada por defecto

  // **Propiedades para Creación y Edición de Puntos de Interés**
  tempPOI: POI | null = null; // Almacena temporalmente el POI en creación
  isPOIModalOpen: boolean = false; // Controla la visibilidad del modal
  poiTitle: string = ''; // Título del POI
  poiRelatedId: number | null = null; // ID relacionado (para categorías específicas)
  selectedIconName: string = 'security'; // Nombre del icono seleccionado (Material Icon)
  selectedIconId: number = 102; // ID del icono seleccionado
  selectedColor: string = '#FFFFFF'; // Color seleccionado para áreas

  // **Propiedades **
  areaHeight: number = 2;
  areaWidth: number = 2;
  startX: number = 0;
  startY: number = 0;
  initialX: number = 0;
  initialY: number = 0;

  // **Métodos Comunes a Todas las Categorías**

  /** Manejar creación y finalización de POI */
  handlePOICreation(event: MouseEvent) {
    const { adjustedX, adjustedY } = this.getAdjustedCoordinates(event);
    const categoryId = +this.selectedCategoryId;

    switch (categoryId) {
      case 1:
        this.createCategory1POI(adjustedX, adjustedY);
        this.hoveredIcon = null;
        break;
      case 3:
        this.createCategory3Area(adjustedX, adjustedY);
        break;
      case 4:
        this.createCategory4Connection(adjustedX, adjustedY);
        break;
    }
  }

  /** Actualizar área en dibujo */
  updateAreaDrawing(event: MouseEvent) {
    const { adjustedX, adjustedY } = this.getAdjustedCoordinates(event);
    const adjustedXAligned = this.alignCoordinate(adjustedX);
    const adjustedYAligned = this.alignCoordinate(adjustedY);
    if(this.isDrawingArea){
      this.startX = Math.min(adjustedXAligned, this.initialX)-1;
      this.startY = Math.min(adjustedYAligned, this.initialY)-1;
      this.areaWidth = Math.abs(adjustedXAligned - this.initialX)+2;
      this.areaHeight = Math.abs(adjustedYAligned - this.initialY)+2;
    }else{
      this.startX = adjustedXAligned-1;
      this.startY = adjustedYAligned-1;
      this.areaWidth = 2;
      this.areaHeight = 2;
    }
    
  }

  savePOI() {
    if (this.tempPOI) {
      // Preparar los datos para el backend
      this.tempPOI.title = this.poiTitle;
      this.tempPOI.relatedId =  this.tempPOI.categoryId === 1? this.selectedInformationCategoryId:this.tempPOI.relatedId;
      this.tempPOI.iconId = this.selectedIconId || 0;
      this.tempPOI.color = this.selectedColor;
      this.tempPOI.iconName = this.selectedIconName;
      const poiData = {
        id: this.tempPOI.id,
        point_name: this.tempPOI.title, // Título del POI
        coordinates: {
          type: 'Point',
          coordinates: [this.tempPOI.x, this.tempPOI.y], // Coordenadas x, y
        },
        categoryId: this.tempPOI.categoryId, // Categoría (1, 2, 3, 4)
        id_point_icon: this.tempPOI.iconId, // Nombre del ícono en lugar de ID del ícono
        id_map: this.tempPOI.mapId, // ID del mapa
        id_map_conexion: this.tempPOI.categoryId === 4 ? this.tempPOI.relatedId : null, // Conexión si es categoría 4
        id_info: (this.tempPOI.categoryId === 1) ? this.tempPOI.relatedId : null, // Información si es categoría 1 o 2
        width: this.tempPOI.width, // Ancho del POI
        height: this.tempPOI.height, // Alto del POI
        color: this.tempPOI.color, // Color del POI
      };
  
      if(this.idEditPOI){
        this.updatePOI(poiData);
      }else{
        console.log('Datos del POI:', poiData);
      // Llamar al servicio para crear un nuevo POI
      this.mapsService.createPointOfInterest(poiData).subscribe({
        next: (response) => {
          console.log('POI creado:', response);
          this.loadPointsOfInterest(); // Recargar los POIs
          this.closePOIModal();
        },
        error: (error) => {
          console.error('Error al crear el POI:', error);
        }
      });
    }}
  }

  updatePOI(poiData: any) {
    const updateData = {
      point_name: poiData.point_name, // Título del POI
      id_info: poiData.id_info==="null"? null : poiData.id_info, // ID relacionado a información
      id_map_conexion: poiData.categoryId === 4 ? poiData.id_map_conexion : null, // ID del mapa de conexión si es categoría 4
    };
    console.log('Datos de actualización:', updateData,poiData.id);
    this.mapsService.updatePointOfInterest(poiData.id, updateData).subscribe({
      next: (response) => {
        console.log('POI actualizado:', response);
        this.loadPointsOfInterest(); // Recargar los POIs
        this.closePOIModal();
      },
      error: (error) => {
        console.error('Error al actualizar el POI:', error);
      }
    });
  }
  
  
 
  /** Cerrar el modal de POI */
  closePOIModal() {
    this.isPOIModalOpen = false;
    this.poiTitle = '';
    this.poiRelatedId = null;
    this.isDrawingArea = false;
  }

  onPOIClick(poi: POI, index: number, event: MouseEvent) {
    event.stopPropagation();
  
    if (this.isEditMode) {
      // Cargar el POI seleccionado en modo edición
      this.poiTitle = poi.title;
      this.poiRelatedId = poi.relatedId;
      this.selectedIconName = poi.iconName;
      this.tempPOI = { ...poi };
      this.idEditPOI = poi.id; // Guardar el ID del POI para edición
      this.selectedInformationCategoryId = poi.relatedId || null;
      this.isPOIModalOpen = true;
    }else if (this.isDeleteMode) {
      // **Modo de eliminación: confirmar eliminación**
      this.deletePOI(poi.id, index); // Llamar al método de eliminación
    } else {
      if(poi.categoryId === 1){
      // Si el POI ya está agrandado, achicarlo
        if (poi.isEnlarged) {
          this.resetPOIVisuals();
         
        } else {
          // Restablecer todos los POIs antes de agrandar el nuevo
          this.resetPOIVisuals();
              // Mostrar la burbuja con el título
          this.selectedBubbleTitle = poi.title;
      
          // Calcular el tamaño y posición de la burbuja
          const textLength = poi.title.length;
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
    }
  
    
  }

  deletePOI(poiId: number, index: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este punto de interés?')) {
      this.mapsService.deletePointOfInterest(poiId).subscribe({
        next: (response) => {
          console.log('POI eliminado:', response);
          this.pois.splice(index, 1); // Elimina el POI de la lista local
          this.idEditPOI = null;
          this.resetPOIVisuals(); // Restablece la visualización de POIs
          this.loadPointsOfInterest(); // Recargar los POIs
        },
        error: (error) => {
          console.error('Error al eliminar el POI:', error);
        }
      });
    }
  }
  
  resetPOIVisuals() {
    this.pois.forEach(poi => {
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
  

  // ==========================
  // **CATEGORÍA 1: Punto de Interés Visible Único**
  // ==========================

  isIconModalOpen = false;
  iconSearchTerm = '';
  iconSize: number = 24; // Tamaño del icono por defecto
  hoveredIcon: { x: number, y: number, iconName: string | null } | null = null; // Icono bajo el mouse
  selectedInformationCategoryId: number | null = null; // ID de la categoría seleccionada

  get filteredIcons() {
    return this.materialIcons.filter(icon =>
      icon.point_icon_name.toLowerCase().includes(this.iconSearchTerm.toLowerCase()) ||
      icon.point_icon_image_path.toLowerCase().includes(this.iconSearchTerm.toLowerCase())
    );
  }

  openIconModal() {
    this.isIconModalOpen = true;
  }

  closeIconModal() {
    this.isIconModalOpen = false;
  }

  selectIcon(iconId: number) {
    const iconName = this.materialIcons.find(icon => icon.id_point_icon === iconId)?.point_icon_image_path || '';
    this.selectedIconId = iconId;
    this.selectedIconName = iconName;
    this.closeIconModal();
  }

  // **Métodos para Categoría 1**

  /** Crear POI para Categoría 1 */
  createCategory1POI(adjustedX: number, adjustedY: number) {
    this.tempPOI = {
      id: 0,
      categoryId: 1,
      x: this.alignCoordinate(adjustedX),
      y: this.alignCoordinate(adjustedY),
      title: '', // Título inicial vacío, se completará en el modal
      iconName: this.selectedIconName, // Icono seleccionado por el usuario
      iconId: this.selectedIconId || 0, // ID del icono seleccionado
      color: this.selectedColor, // Color del fondo circular
      relatedId: this.selectedInformationCategoryId, // Por defecto, no está relacionado
      width: this.iconSize, // Tamaño dinámico basado en el selector de tamaño
      height: this.iconSize, // Igual que el ancho para mantener la proporción
      originalWidth: this.iconSize, // Guardar ancho original
      originalHeight: this.iconSize, // Guardar alto original
      mapId: this.id || 0, // ID del mapa actual
      isEnlarged: false, // Inicialmente no agrandado
    };

    // Previsualización del POI en el modal de título
    this.selectedInformationCategoryId = null;
    this.isPOIModalOpen = true;
  }

  // ==========================
  // **CATEGORÍA 3: Zona de Interés**
  // ==========================

  // **Métodos para Categoría 3**

  /** Crear Área para Categoría 3 */
  createCategory3Area(adjustedX: number, adjustedY: number) {
    if (!this.isDrawingArea) {
      this.initialX = this.startX = this.alignCoordinate(adjustedX);
      this.initialY = this.startY = this.alignCoordinate(adjustedY);
      this.startX = this.startX-1;
      this.startY = this.startY-1;
      this.areaHeight = 2;
      this.areaWidth = 2;
      this.isDrawingArea = true;
    } else {
      const finalX = this.alignCoordinate(adjustedX);
      const finalY = this.alignCoordinate(adjustedY);

      this.startX = Math.min(finalX, this.initialX);
      this.startY = Math.min(finalY, this.initialY);

      this.areaWidth = Math.abs(finalX - this.initialX);
      this.areaHeight = Math.abs(finalY - this.initialY);
      this.tempPOI = {
        id: 0,
        categoryId: 3,
        x: this.startX,
        y: this.startY,
        width: this.areaWidth,
        height: this.areaHeight,
        originalWidth: this.areaWidth,
        originalHeight: this.areaHeight,
        isEnlarged  : false,
        color: this.selectedColor,
        title: '',
        relatedId: null,
        mapId: this.id || 0,
        iconName: '',
        iconId: 0,
      };
      this.isDrawingArea = false;
      this.selectedInformationCategoryId = null;
      this.isPOIModalOpen = true;
    }
  }

  // ==========================
  // **CATEGORÍA 4: Zona de Conexión**
  // ==========================

  // **Propiedades para Categoría 4**
  isMapSelectionModalOpen: boolean = false;
  selectedBuilding: string = '';
  selectedFloor: number = 1;

  // **Métodos para Categoría 4**

  /** Crear Conexión para Categoría 4 */
  createCategory4Connection(adjustedX: number, adjustedY: number) {
    if (!this.isDrawingArea) {
      this.initialX = this.startX = this.alignCoordinate(adjustedX);
      this.initialY = this.startY = this.alignCoordinate(adjustedY);
      this.startX = this.startX-1;
      this.startY = this.startY-1;
      this.areaHeight = 2;
      this.areaWidth = 2;
      this.selectedColor = 'rgba(128, 128, 128, 0.9)';
      this.isDrawingArea = true;
    } else {
      const finalX = this.alignCoordinate(adjustedX);
      const finalY = this.alignCoordinate(adjustedY);

      this.startX = Math.min(finalX, this.initialX);
      this.startY = Math.min(finalY, this.initialY);

      this.areaWidth = Math.abs(finalX - this.initialX);
      this.areaHeight = Math.abs(finalY - this.initialY);
      this.tempPOI = {
        id: 0,
        categoryId: 4,
        x: this.startX,
        y: this.startY,
        width: this.areaWidth,
        height: this.areaHeight,
        isEnlarged  : false,
        originalWidth: this.areaWidth,
        originalHeight: this.areaHeight,
        color: this.selectedColor,
        title: '',
        relatedId: null,
        mapId: this.id || 0,
        iconName: '',
        iconId: 0,
      };
      this.isDrawingArea = false;
      this.openMapSelectionModal();
    }
  }

  /** Abrir Modal de Selección de Mapa */
  openMapSelectionModal() {
    this.isMapSelectionModalOpen = true;
  }
  fixedMapData: Record<string, { floor: number; id_map: number }[]> = {
    'Boulevard': [
      { floor: 1, id_map: 1 }, // Boulevard piso 1
      { floor: 2, id_map: 2 }, // Piso 2
      { floor: 3, id_map: 3 }, // Piso 3
    ],
    'Sede Principal': [
      { floor: 1, id_map: 4 }, // Piso 1
      { floor: 5, id_map: 5 }, // Piso 5
      { floor: 6, id_map: 6 }, // Piso 6
      { floor: 7, id_map: 7 }, // Piso 7
    ]
  };
  fixedMapKeys: string[] = Object.keys(this.fixedMapData); // Claves de edificios
  getFloorsForBuilding(building: string): { floor: number; id_map: number }[] {
    return this.fixedMapData[building] || [];
  }
  
  saveMapSelection(building: string, floor: number) {
    const selectedMap = this.fixedMapData[building]?.find(map => map.floor == floor);

    if (selectedMap && this.tempPOI) {
        this.tempPOI.relatedId = selectedMap.id_map; // Asignar el id_map relacionado
        console.log('Map seleccionado, ID:', selectedMap.id_map);

        // Cerrar modal de selección de mapa
        this.isMapSelectionModalOpen = false;

        // Llamar a savePOI con los datos actualizados
        this.savePOI();
    } else {
        console.warn('Mapa no encontrado para la combinación de edificio y piso seleccionada.');
    }
  }

  /** Cerrar Modal de Selección de Mapa */
  closeMapSelectionModal() {
    this.isMapSelectionModalOpen = false;
    this.tempPOI = null;
  }

  /** Navegar a un Mapa Específico */
  navigateToMap(mapId: number) {
    this.router.navigate(['/maps/map/', mapId]).then(() => {
      this.loadData(); // Recarga los datos del mapa actual
    });
  }
  navigateToMaps() {
    this.router.navigate(['/maps']);
  }
  

}