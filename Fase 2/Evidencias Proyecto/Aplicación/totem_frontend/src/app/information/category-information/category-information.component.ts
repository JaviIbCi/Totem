import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  HostListener,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewEncapsulation 
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InformationService } from '../../services/information.service';
import { NewsService } from '../../services/news.service';
import { GlobalService } from '../../services/global.service'; // Import GlobalService
import { ChangeDetectorRef } from '@angular/core';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

/**
 * Interface representing an information card.
 */
interface InformationCard {
  title: string;
  imagePath: string;
}

/**
 * Interface representing a news post.
 */
interface NewsPost {
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  media_url: string;
  caption?: string;
}

@Component({
  selector: 'app-category-information',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbCarouselModule],
  templateUrl: './category-information.component.html',
  styleUrls: ['./category-information.component.css'],
  encapsulation: ViewEncapsulation.None, // Desactiva la encapsulación
})
export class CategoryInformationComponent implements OnInit, AfterViewInit, OnDestroy {
  isBrowser: boolean;

  // References to elements in the template
  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('currentVideoElement') currentVideo!: QueryList<ElementRef<HTMLVideoElement>>;


  // Search and data loading variables
  searchText: string = '';
  cards: InformationCard[] = [];
  filteredCards: InformationCard[] = [];
  isMuted: boolean = true; // Variable para controlar el estado de silencio
  isVideo: boolean = true; // Variable para controlar el estado de silencio
  // News posts
  newsPosts: NewsPost[] = [];
  // Nueva lógica para teclado flotante
  isKeyboardVisible: boolean = false;
  keyboard!: Keyboard;
  // Carousel indices and states
  currentIndex = 0;
  previousSlideIndex: number = 0;

  // Carousel configuration variables
  pauseOnHover: boolean = true;
  pauseOnFocus: boolean = true;
  autoSlideInterval = 10000; // 10 seconds

  // Modal control variables
  selectedPost: NewsPost | null = null;
  showModal: boolean = false;
  pausedVideoElement: HTMLVideoElement | null = null;

  // Variables to handle video playback and events
  currentVideoElement: HTMLVideoElement | null = null;
  videoEndedListener: (() => void) | null = null;

  // Timer for debouncing the search input
  private searchTimeout: any = null;

  constructor(
    private informationService: InformationService,
    private newsService: NewsService,
    private globalService: GlobalService, // Inject GlobalService
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Inyección del ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * On component initialization.
   */
  ngOnInit(): void {
    this.registerClick("home","visit","news");
    this.loadInformationPages(); // Cargar información
    this.loadNewsData(); // Cargar noticias
  
    this.checkTotemMode(); // Verificar modo de tótem
  
    if (!this.isTotem) {
      this.route.fragment.subscribe((fragment) => {
        if (isPlatformBrowser(this.platformId) && fragment) {
          setTimeout(() => { // Espera de 100 ms
            const targetElement = document.getElementById(fragment) as HTMLElement;
  
            if (targetElement) {
              const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({
                top: elementPosition - 100, // Ajustar 100px hacia arriba
                behavior: 'smooth'
              });
            }
          }, 100); // 100 milisegundos
        }
      });
    }
  }
 

  openVirtualKeyboard(): void {
    if (this.isTotem) {
      this.isKeyboardVisible = true;
      this.cdr.detectChanges(); // Forzar la detección de cambios
      this.initializeKeyboard();
    }
  }
  

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
      keyboardElementStyle.style.top = '56%';
      keyboardElementStyle.style.left = '50%';
      keyboardElementStyle.style.transform = 'translate(-50%, 100%)'; // Center keyboard
      keyboardElementStyle.style.width = '100%';
      keyboardElementStyle.style.height = '660px';
      keyboardElementStyle.style.background = 'rgba(255, 255, 255, 0.5)';
      keyboardElementStyle.style.zIndex = '1000';
      keyboardElementStyle.style.borderRadius = '10px';
      keyboardElementStyle.style.padding = '20px';
      keyboardElementStyle.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }
  }


  onInputChange(input: string): void {
    this.searchText = input;
    this.filterCards();
  }

  onKeyPress(button: string): void {
    if (button === '{enter}') {
      this.closeVirtualKeyboard();
    }
    
    if (button === '{bksp}') {
      this.searchText = this.searchText.slice(0, -1); // Elimina el último carácter del campo de texto
    }
  }
  

  scrollToFragment(fragment: string) {
    const element = document.getElementById(fragment);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.isBrowser) { // Asegura que solo se ejecute en el navegador
      this.checkTotemMode();
    }
  }
  private checkTotemMode(): void {
    if (this.isBrowser) { // Asegura que solo se ejecute en el navegador
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      // Cambia a modo totem si las dimensiones coinciden con 2160x3840
      this.isTotem = windowWidth === 2160 && windowHeight === 3840;
    }
  }

  /**
   * After the view initializes.
   */
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Verifica si hay videos disponibles inicialmente
      this.initializeFirstVideo();
  
      this.carousel.cycle(); // Inicia el carrusel
    }
  }
  
  private initializeFirstVideo(): void {
    // Inicializa el índice de la diapositiva anterior
    if (this.previousSlideIndex === null) {
      this.previousSlideIndex = 0; // Configura el primer índice como 0
    }
  
    // Pausa y resetea cualquier video actual antes de inicializar el primero
    if (this.currentVideoElement) {
      this.currentVideoElement.pause();
      this.currentVideoElement.currentTime = 0; // Reinicia el tiempo del video actual
      if (this.videoEndedListener) {
        this.currentVideoElement.removeEventListener('ended', this.videoEndedListener);
        this.videoEndedListener = null;
      }
    }
  
    // Inicializa el primer video
    const firstVideoElement = this.currentVideo.first?.nativeElement;
    if (firstVideoElement) {
      firstVideoElement.muted = this.isMuted;
      firstVideoElement.volume = this.isMuted ? 0 : 0.5; // Volumen inicial
      firstVideoElement.play().catch((error) => {
        console.error('Error al intentar reproducir el primer video:', error);
      });
  
      this.currentVideoElement = firstVideoElement;
      this.isVideo = true;
      this.progress = 0; // Resetea la barra de progreso
      this.carousel.pause();
  
      // Agregar listener para el evento 'ended'
      this.videoEndedListener = () => this.onVideoEnded();
      firstVideoElement.addEventListener('ended', this.videoEndedListener);
    } else {
      this.isVideo = false;
    }
    const firstPost = this.newsPosts[0];
    this.updateCurrentPost(firstPost);
    this.cdr.detectChanges(); // Asegura la sincronización con la vista
  }
  
  
  /**
   * On component destruction.
   */
  ngOnDestroy(): void {
    this.carousel.pause(); // Pause the carousel when destroying the component

    // Remove 'ended' event listener from current video element
    if (this.currentVideoElement && this.videoEndedListener) {
      this.currentVideoElement.removeEventListener('ended', this.videoEndedListener);
      this.videoEndedListener = null;
    }
  }

  /**
   * Loads information pages from the service.
   */
  loadInformationPages(): void {
    this.informationService.getAllInformationPages().subscribe({
      next: (data) => {
        this.cards = data.informationPages.map((page: any) => ({
          title: page.information_title,
          imagePath:
            page.images && page.images.length > 0
              ? `https://totemvespucio.cl/assets/informaciones/${page.images[0].information_image_path}`
              : '/images/discover-us-placeholder.webp', // Use a placeholder if no image
        }));
        this.filteredCards = this.cards;
      },
      error: (err) => console.error('Error fetching information pages', err),
    });
  }
  toggleMute(): void {
    this.isMuted = !this.isMuted;
  
    // Si hay un video actual en reproducción, actualiza su estado de muteo y volumen
    if (this.currentVideoElement) {
      this.currentVideoElement.muted = this.isMuted;
      this.currentVideoElement.volume = this.isMuted ? 0 : 0.5; // Ajusta el volumen a 0.5 si no está muteado
      this.volume = 0.5;
    }
 
    this.cdr.detectChanges();
  }
  
  volume: number = 0.5; // Volumen inicial
  progress: number = 0; // Progreso inicial

setVolume(event: any): void {
  const video = this.currentVideoElement as HTMLVideoElement;
  video.volume = event.target.value;
  
}

initializeProgressBar(): void {
  const video = this.currentVideoElement as HTMLVideoElement;
  this.progress = (video.currentTime / video.duration) * 100;
}

updateProgressBar(): void {
  if (this.currentVideoElement) {
    const currentTime = this.currentVideoElement.currentTime;
    const duration = this.currentVideoElement.duration;
    this.progress = (currentTime / duration) * 100;

    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }
}


showVolumeSlider: boolean = false; // Estado del slider de volumen

toggleVolumeSlider(event: MouseEvent): void {
  this.showVolumeSlider = !this.showVolumeSlider;
  event.stopPropagation(); // Evita que el click se propague
}

 

showQRModal: boolean = false;
qrCodeUrl: string = '';
currentPost: NewsPost | null = null;
hasPermalink: boolean = false; // Indica si el post actual tiene un permalink
isTotem:boolean = true;

followPost(post: NewsPost | null): void {
  if (post !== null) {
    // Registrar el clic de la noticia
    this.registerClick('news', 'follow', post.caption || 'Unknown Post');

    if (this.isTotem) {
      // Generar QR si es modo Totem
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(post.permalink)}`;
      this.showQRModal = true; // Mostrar el modal con el QR
    } else {
      // Redirigir a una nueva pestaña si no es modo Totem
      window.open(post.permalink, '_blank');
    }
  }
}

 
closeQRModal(): void {
  this.showQRModal = false;
}

checkPermalink(post: NewsPost | null): void {
  this.hasPermalink = !!post?.permalink;
}

updateCurrentPost(post: NewsPost | null): void {
  this.currentPost = post;
  this.hasPermalink = !!post?.permalink; // Verifica si el permalink existe y no está vacío
}
@HostListener('document:click', ['$event'])
onClickOutside(event: Event): void {
  if (this.showModal) {
    const targetElement = event.target as HTMLElement;
    const modalContent = document.querySelector('.modal-content');
    
    if (modalContent && !modalContent.contains(targetElement)) {
      this.closeModal();
    }
  }
  if (this.showVolumeSlider) {
    const targetElement = event.target as HTMLElement;
    const volumeContainer = document.querySelector('.volume-container');

    if (volumeContainer && !volumeContainer.contains(targetElement)) {
      this.showVolumeSlider = false;
    }
  }
  const clickedInsideKeyboard = (event.target as HTMLElement).closest('.keyboard-container');
  const clickedInsideInput = (event.target as HTMLElement).closest('.form-control');
    if (!clickedInsideKeyboard && !clickedInsideInput && this.isKeyboardVisible) {
 
      this.closeVirtualKeyboard();
    }
}
 
seek(event: any): void {
  const video = this.currentVideoElement as HTMLVideoElement;
  const seekTime = (event.target.value / 100) * video.duration;
  video.currentTime = seekTime;
}
isPlaying: boolean = true;

handleVideoClick(): void {
  if (this.currentVideoElement) {
    // Registrar el click en el log
    this.registerClick('video', 'click', this.currentVideoElement.src);

    // Si el video está muteado, desmutea
    if (this.currentVideoElement.muted) {
      this.currentVideoElement.muted = false;
      this.isMuted = false;
      this.currentVideoElement.volume = this.volume; // Restaurar el volumen actual
    } else {
      // Si no está muteado, alterna entre play y pause
      this.togglePlayPause();
    }
  }
}

togglePlayPause(): void {
  if (this.currentVideoElement) {
    if (this.currentVideoElement.paused) {
      this.currentVideoElement.play().catch((error) => {
        console.error('Error al intentar reproducir el video:', error);
      });
      this.isPlaying = true;
    } else {
      this.currentVideoElement.pause();
      this.isPlaying = false;
    }
  }
}

  /**
   * Loads news posts from the service.
   */
  loadNewsData(): void {
    this.newsService.getAllNews().subscribe({
      next: (data) => {
        this.newsPosts = data.data; // Save the news posts
  
      },
      error: (err) => console.error('Error fetching news:', err),
    });
  }
  registerImageClick(post: NewsPost | null): void {
    if(post!==null)
    this.registerClick('news', 'image', post.caption || 'Unknown Post');
  }

  /**
   * Handles slide events to control video playback.
   * @param event The slide event data.
   */

  extractSlideIndex(slideId: string): number {
    const match = slideId.match(/slide-(\d+)/);
    return match ? parseInt(match[1], 10) : -1; // Retorna -1 si no se encuentra un número
  }
  
  onSlide(event: any): void {
    // Verifica si el índice es válido
    const currentIndex = this.extractSlideIndex(event.current);

    if (currentIndex >= 0 && currentIndex < this.newsPosts.length) {
      this.updateCurrentPost(this.newsPosts[currentIndex]);
    } else {
      this.updateCurrentPost(null); // Si no hay una publicación válida
    }
  
    // Pausar el video actual antes de cambiar de slide
    if (this.currentVideoElement) {
      this.currentVideoElement.pause();
      this.currentVideoElement.currentTime = 0;
      if (this.videoEndedListener) {
        this.currentVideoElement.removeEventListener('ended', this.videoEndedListener);
        this.videoEndedListener = null;
      }
      this.currentVideoElement = null;
    }
  
    // Pausar y resetear el video del slide anterior
    if (this.previousSlideIndex !== null && this.previousSlideIndex !== event.current) {
      const previousSlideElement = document.getElementById(`slide-${this.previousSlideIndex}`);
      const previousVideoElement = previousSlideElement?.querySelector('video') as HTMLVideoElement;
  
      if (previousVideoElement) {
        previousVideoElement.pause();
        previousVideoElement.currentTime = 0;
      }
    }
  
    // Verificar si el slide actual es un video
    const currentSlideElement = document.getElementById(`slide-${event.current}`);
    const currentVideoElement = currentSlideElement?.querySelector('video') as HTMLVideoElement;
  
    if (currentVideoElement) {
      this.isVideo = true;
      currentVideoElement.muted = this.isMuted;
      currentVideoElement.volume = this.isMuted ? 0 : this.volume;
      currentVideoElement.play().catch((error) => {
        console.error('Error al intentar reproducir el video:', error);
      });
  
      this.videoEndedListener = () => this.onVideoEnded();
      currentVideoElement.addEventListener('ended', this.videoEndedListener);
  
      this.currentVideoElement = currentVideoElement;
      this.progress = 0;
      this.carousel.pause();
    } else {
      this.isVideo = false;
      this.carousel.cycle();
    }
  
    this.previousSlideIndex = event.current;
    this.cdr.detectChanges();
  }
  
  /**
   * Called when the video ends; moves to the next slide.
   */
  onVideoEnded(): void {
    // Move to the next slide
    this.carousel.next();
  }

  /**
   * Opens the modal to display the selected news post.
   * Also registers a click event when a news post is clicked.
   * @param post The selected news post.
   * @param videoElement Optional video element to pause.
   */
  openModal(post: NewsPost, videoElement?: HTMLVideoElement): void {
    this.selectedPost = post;
    this.showModal = true;
    this.carousel.pause(); // Pause the carousel

    if (videoElement) {
      videoElement.pause();
      this.pausedVideoElement = videoElement;
    }

    // Register click event for news post
    this.registerClick('news', 'post', post.caption || 'Unknown Post');
  }

  /**
   * Closes the modal and resumes the carousel.
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;

    if (this.pausedVideoElement) {
      this.pausedVideoElement.play();
      this.pausedVideoElement = null;
    }

    if (this.isBrowser) {
      this.carousel.cycle(); // Resume the carousel
    }
  }

  /**
   * Filters the information cards based on the search text with a 1-second debounce.
   */
  filterCards(): void {
    // Clear any existing debounce timer
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set a new debounce timer
    this.searchTimeout = setTimeout(() => {
      this.executeSearch();
    }, 1000); // Waits 1 second after the user stops typing
  }

  /**
   * Executes the search and updates the filtered cards.
   * Also registers a search event if the search text is not empty.
   */
  private executeSearch(): void {
    const normalizeText = (text: string) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normalizedSearchText = normalizeText(this.searchText.toLowerCase());

    this.filteredCards = this.cards.filter((card) =>
      normalizeText(card.title.toLowerCase()).includes(normalizedSearchText)
    );

    // Only register search if the search text is not empty
    if (this.searchText.trim() !== '') {
      this.registerSearch('information', 'search', this.searchText);
    }
  }

  /**
   * Navigates to the specific information page.
   * Also registers a click event when a category is selected.
   * @param name The name of the information page.
   */
  goToInformationPage(name: string): void {
    // Register click event for category selection
    this.registerClick('information', 'category', name);

    this.router.navigate(['/informacion-area', name]);
  }

  /**
   * Handles image loading errors by replacing the source with a fallback image.
   * @param event The error event.
   * @param fallbackSrc The fallback image source.
   */
  onImageError(event: Event, fallbackSrc: string): void {
    const target = event.target as HTMLImageElement;
    target.src = fallbackSrc;
  }

  /**
   * TrackBy function for the news posts.
   * @param index The index of the item.
   * @param item The news post item.
   * @returns A unique identifier for the item.
   */
  trackByFn(index: number, item: NewsPost): string {
    return item.media_url; // Use a unique identifier
  }

  /**
   * Checks if the post is an Instagram post.
   * @param permalink The permalink of the post.
   * @returns True if it's an Instagram post, false otherwise.
   */
  isInstagramPost(permalink: string | undefined): boolean {
    // Verify that the permalink is not undefined and contains "instagram.com"
    return permalink ? permalink.includes('instagram.com') : false;
  }

  /**
   * Registers a click event by calling the GlobalService.
   * @param component The component where the click occurred.
   * @param selection The type of selection made.
   * @param details Additional details about the click.
   */
  private registerClick(component: string, selection: string, details: string): void {
    this.globalService.addClickLog(component, selection, details).subscribe({
      next: (response: any) => {
        console.log('Click log registered:', response,component,selection,details);
      },
      error: (error: any) => {
        console.error('Error registering click log:', error);
      }
    });
  }

  /**
   * Registers a search event by calling the GlobalService.
   * @param component The component where the search occurred.
   * @param selection The type of selection made.
   * @param details Additional details about the search.
   */
  private registerSearch(component: string, selection: string, details: string): void {
    this.globalService.addSearchLog(component, selection, details).subscribe({
      next: (response: any) => {
        console.log('Search log registered:', response);
      },
      error: (error: any) => {
        console.error('Error registering search log:', error);
      }
    });
  }
}
