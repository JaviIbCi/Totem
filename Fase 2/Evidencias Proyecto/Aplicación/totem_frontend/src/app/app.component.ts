import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'totem_frontend';

  // Controls whether the mobile menu is open or closed
  isMenuOpen = false;

  // Determines if the current view is on a mobile device
  isMobileView = false;

  constructor() {
    // Check screen size on component initialization
    this.checkScreenSize();
  }

  // Listen for window resize events to update mobile or desktop view
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  // Method to check screen size and update isMobileView
  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth <= 850;
    } else {
      // Default to desktop view if window is not defined
      this.isMobileView = false;
    }
  }

  // Method to toggle the mobile menu state
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Method to close the mobile menu
  closeMenu() {
    this.isMenuOpen = false;
  }

  // Detect clicks outside the menu to automatically close it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (
      this.isMenuOpen &&
      !targetElement.closest('nav') &&
      !targetElement.closest('.navbar-toggler')
    ) {
      this.closeMenu();
    }
  }

}
