import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InformationService } from '../../services/information.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalService } from '../../services/global.service'; // Import GlobalService


/**
 * Interface for Information Images.
 */
interface InformationImage {
  information_image_path: string;
  details_image_information: SafeHtml | null;
}

/**
 * Interface for Frequently Asked Questions (FAQs).
 */
interface Faq {
  faq_question: string;
  faq_answer: string;
}

/**
 * Interface for Collaborators.
 */
interface Collaborator {
  full_name: string;
  role: string;
  email: string;
  image_path: string;
  details: string;
}

@Component({
  selector: 'app-index-information',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './index-information.component.html',
  styleUrls: ['./index-information.component.css'],
})
export class IndexInformationComponent implements OnInit {
  // Title and details of the information page
  information_title: string = '';
  information_details: SafeHtml = '';

  // Lists of images, FAQs, and collaborators
  images: InformationImage[] = [];
  faq_category_name: string | null = null;
  Faqs: Faq[] = [];
  collaborators: Collaborator[] = [];

  // Map point ID (if any)
  map_point_id: number | null = null;

  // Index of the currently expanded FAQ
  expandedFaq: number | null = null;

  // Nueva propiedad para el buscador
  searchQuery: string = '';

  constructor(
    private router: Router,
    private informationService: InformationService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private globalService: GlobalService // Inject GlobalService
  ) {}

  /**
   * On component initialization, fetch information data based on the route parameter.
   */
  ngOnInit(): void {
    this.registerClick('home', 'visit', 'informations');
    const name = this.route.snapshot.paramMap.get('name');

    if (name) {
      this.informationService.getInformationPageByName(name).subscribe({
        next: (data) => {
          // Assign fetched data to component properties
          this.information_title = data.information.information_title;
          this.information_details = this.sanitizer.bypassSecurityTrustHtml(
            data.information.information_details
          );
          this.images = data.information.images;
          this.faq_category_name =
            data.information.faq_category?.faq_category_name || null;
          this.Faqs = data.information.faq_category?.Faqs || [];
          this.collaborators = data.information.InformationCollaborators.map(
            (collab: any) => ({
              full_name: collab.Collaborator.full_name,
              role: collab.Collaborator.role,
              email: collab.Collaborator.email.toLowerCase(),
              image_path: collab.Collaborator.image_path,
              details: collab.details,
            })
          );
          this.map_point_id = data.information.map_point_id || null;
        },
        error: (err) => console.error('Error fetching information', err),
      });
    }
  }
  

  // Getter para preguntas filtradas
  get filteredFaqs(): Faq[] {
    // Normaliza el texto de búsqueda y las preguntas eliminando acentos y pasando todo a minúsculas
    const normalize = (text: string): string =>
      text
        .toLowerCase()
        .normalize('NFD') // Descompone caracteres con acento en base y tilde
        .replace(/[\u0300-\u036f]/g, ''); // Elimina los diacríticos

    const query = normalize(this.searchQuery);

    return this.Faqs.filter((faq) =>
      normalize(faq.faq_question).includes(query)
    );
  }

  /**
   * Toggles the expansion of a FAQ item.
   * Also registers a click event when a FAQ question is clicked.
   * @param index Index of the FAQ item.
   */
  toggleFaq(index: number): void {
    this.expandedFaq = this.expandedFaq === index ? null : index;

    // Register click log for FAQ question
    const faqQuestion = this.Faqs[index]?.faq_question || 'Unknown Question';
    this.registerClick('information', 'faq_question', faqQuestion);
  }

  /**
   * Handles image click events.
   * Registers a click event when an image is clicked.
   * @param image The image that was clicked.
   */
  onImageClick(image: InformationImage): void {
    // Register click log for image
    const imagePath = image.information_image_path || 'Unknown Image';
    this.registerClick('information', 'image', imagePath);
  }

  /**
   * Handles collaborator card click events.
   * Registers a click event when a collaborator is clicked.
   * @param collaborator The collaborator that was clicked.
   */
  onCollaboratorClick(collaborator: Collaborator): void {
    // Register click log for collaborator
    this.registerClick('information', 'collaborator', collaborator.full_name);
  }

  /**
   * Handles image load errors by replacing the source with a fallback image.
   * @param event The error event.
   * @param fallbackSrc The fallback image source.
   */
  onImageError(event: Event, fallbackSrc: string): void {
    const target = event.target as HTMLImageElement;
    target.src = fallbackSrc;
  }

  /**
   * Navigates back to the categories index.
   */
  goToCategories(): void {
    this.router.navigate(['/categorias-informacion-area']);
  }

  /**
   * Registers a click event by calling the GlobalService.
   * @param component The component where the click occurred.
   * @param selection The type of selection made.
   * @param details Additional details about the click.
   */
  private registerClick(
    component: string,
    selection: string,
    details: string
  ): void {
    this.globalService.addClickLog(component, selection, details).subscribe({
      next: (response: any) => {
        console.log('Click log registered:', response);
      },
      error: (error: any) => {
        console.error('Error registering click log:', error);
      },
    });
  }
}
