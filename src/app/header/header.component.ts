import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('navbarContent') navbarContent!: ElementRef;
  @ViewChild('navbarToggler') navbarToggler!: ElementRef;
  
  constructor(public themeService: ThemeService, private elementRef: ElementRef) {}
  
  toggleTheme() {
    const newTheme = this.themeService.theme === 'dark' ? 'light' : 'dark';
    this.themeService.apply(newTheme);
  }
  
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const isMobile = window.innerWidth < 992;
    const clickedInsideNavbar = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInsideNavbar && isMobile && this.isNavbarOpen()) {
      this.navbarToggler.nativeElement.click();
    }
  }

  private isNavbarOpen(): boolean {
    return this.navbarContent?.nativeElement.classList.contains('show');
  }
}
