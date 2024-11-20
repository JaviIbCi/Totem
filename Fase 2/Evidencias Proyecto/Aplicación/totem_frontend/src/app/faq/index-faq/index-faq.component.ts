import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FaqService } from '../../services/faq.service';
import { GlobalService } from '../../services/global.service';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

/**
 * Interface representing a Frequently Asked Question (FAQ).
 */
interface Faq {
  faq_question: string;
  faq_answer: string | SafeHtml;
  category: string;
}

/**
 * Interface representing a Category containing FAQs.
 */
interface Category {
  faq_category_name: string;
  Faqs: Faq[];
}

@Component({
  selector: 'index-faq',
  templateUrl: './index-faq.component.html',
  styleUrls: ['./index-faq.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class IndexFaqComponent implements OnInit, AfterViewInit {
  // Stores the list of categories and their FAQs
  categories: Category[] = [];

  // Stores all FAQs for searching and filtering
  faqs: Faq[] = [];

  // Stores the FAQs filtered by category or search query
  filteredItems: Faq[] = [];

  // The name of the currently selected category
  selectedCategory: string | null = null;

  // The FAQ that is currently expanded to show its answer
  expandedFaq: Faq | null = null;

  // Manages the transition effect when toggling FAQs
  transitioningFaq: Faq | null = null;

  // User's search query
  searchQuery: string = '';

  // Timer for debouncing the search input
  private searchTimeout: any = null;

  // Platform detection
  isBrowser: boolean;
  isTotemView: boolean = false;
  isMobileView: boolean = false;
  isKeyboardVisible: boolean = false;

  // Virtual Keyboard instance
  keyboard!: Keyboard;

  constructor(
    private faqService: FaqService,
    private sanitizer: DomSanitizer,
    private globalService: GlobalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detect if running in browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Initializes the component by fetching all FAQs.
   */
  ngOnInit(): void {
    this.registerClick("home","visit","faqs");
    this.detectViewMode();
    this.faqService.getAllFaqs().subscribe({
      next: (data) => {
        // Filtrar categorías que tengan preguntas
        this.categories = (data.categories as Category[]).filter(category => category.Faqs && category.Faqs.length > 0);
  
        // Aplanar todas las FAQs de las categorías filtradas en un solo array
        this.faqs = this.categories.flatMap((category) => {
          return category.Faqs.map((faq) => ({
            ...faq,
            faq_answer: faq.faq_answer as string,
          }));
        });
  
        // Inicialmente, todas las FAQs están visibles
        this.filteredItems = this.faqs;
      },
      error: (err) => console.error('Error al obtener las FAQs', err),
    });
  }
  
  /**
   * After view initialization.
   */
  ngAfterViewInit(): void {
    // Additional initialization if needed
  }

  /**
   * Listens for window resize events to adjust view mode.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.detectViewMode();
  }

  /**
   * Detects the current view mode based on screen size.
   */
  detectViewMode(): void {
    if (this.isBrowser) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Detect "totem" view
      if (width >= 2160 && height >= 3840) {
        this.isTotemView = true;
        this.isMobileView = false;
      }
      // Detect mobile view
      else if (width < 850) {
        this.isTotemView = false;
        this.isMobileView = true;
      }
      // PC view
      else {
        this.isTotemView = false;
        this.isMobileView = false;
      }

      // Re-initialize keyboard if necessary
      if (this.isKeyboardVisible && !this.isTotemView) {
        // Hide keyboard if not in "totem" view
        this.isKeyboardVisible = false;
      }
    }
  }

  /**
   * Opens the virtual keyboard.
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
   * Closes the virtual keyboard.
   */
  closeVirtualKeyboard(): void {
    this.isKeyboardVisible = false;
  }

  /**
   * Initializes the virtual keyboard.
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
      keyboardElementStyle.style.top = '50%';
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

  /**
   * Handles input changes from the virtual keyboard.
   * @param input The current input value.
   */
  onInputChange(input: string): void {
    this.searchQuery = input;
    this.search(this.searchQuery);
  }

  /**
   * Handles key presses on the virtual keyboard.
   * @param button The button that was pressed.
   */
  onKeyPress(button: string): void {
    if (button === '{enter}') {
      this.closeVirtualKeyboard();
    }
    
    if (button === '{bksp}') {
      this.searchQuery = this.searchQuery.slice(0, -1); // Elimina el último carácter del campo de texto
    }
  }
  

  /**
   * Detects clicks outside the virtual keyboard to close it.
   * @param event The click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isKeyboardVisible && this.isTotemView) {
      const clickedInsideKeyboard = (event.target as HTMLElement).closest(
        '.keyboard-container'
      );
      const clickedOnSearchBar = (event.target as HTMLElement).closest(
        '.search-input'
      );
      if (!clickedInsideKeyboard && !clickedOnSearchBar) {
        this.closeVirtualKeyboard();
      }
    }
  }

  /**
   * Filters FAQs based on the selected category.
   * Also registers a click log for selecting a category.
   * @param categoryName The name of the category to filter by.
   */
  filterByCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
    const selectedCategory = this.categories.find(
      (category) => category.faq_category_name === categoryName
    );
    this.filteredItems = selectedCategory ? selectedCategory.Faqs : [];
    this.expandedFaq = null; // Reset expanded FAQ when category changes

    // Register click log for category selection
    this.registerClick('faqs', 'category', categoryName);
  }

  /**
   * Clears the category filter to show all FAQs.
   */
  clearFilter(): void {
    this.selectedCategory = null;
    this.searchQuery = ''; // Clear the search input
    this.filteredItems = this.faqs;
    this.expandedFaq = null; // Reset expanded FAQ when filter is cleared
  } 

  /**
   * Handles user input in the search box with a 1-second debounce.
   * @param query The user's search query.
   */
  search(query: string): void {
    this.searchQuery = query;

    // Clear any existing debounce timer
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set a new debounce timer
    this.searchTimeout = setTimeout(() => {
      this.executeSearch(query);
    }, 1000); // Waits 1 second after the user stops typing
  }

  /**
   * Executes the search and updates the filtered FAQs.
   * Also registers a search log if the query is not empty.
   * @param query The search query to execute.
   */
  private executeSearch(query: string): void {
    const normalizedQuery = this.removeAccents(query.toLowerCase());

    // Filter FAQs that include the search query
    this.filteredItems = this.faqs.filter((item) =>
      this.removeAccents(item.faq_question.toLowerCase()).includes(
        normalizedQuery
      )
    );

    // Only register search log if query is not empty
    if (query.trim() !== '') {
      // Register search log
      this.registerSearch('faqs', 'search', query);
    }
  }

  /**
   * Removes accents from a string for normalized searching.
   * @param text The text to normalize.
   * @returns The normalized text without accents.
   */
  private removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Toggles the expansion of an FAQ to show or hide its answer.
   * Also registers a click log when a new question is opened.
   * @param faq The FAQ to toggle.
   */
  toggle(faq: Faq): void {
    if (this.expandedFaq === faq) {
      // Collapse the currently expanded FAQ
      this.transitioningFaq = faq;
      setTimeout(() => {
        this.expandedFaq = null;
        this.transitioningFaq = null;
      }, 500); // Duration of the collapse animation
    } else {
      // Collapse any other expanded FAQ and expand the new one
      if (this.expandedFaq) {
        this.transitioningFaq = this.expandedFaq;
        setTimeout(() => {
          this.expandedFaq = faq;
          this.transitioningFaq = null;
        }, 500); // Wait for the collapse animation before expanding
      } else {
        // Expand the selected FAQ
        this.expandedFaq = faq;
      }

      // Register click log for opening a new question
      this.registerClick('faqs', 'question', faq.faq_question);
    }
  }

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
