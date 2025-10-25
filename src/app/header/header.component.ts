import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { getCurrentHashRoute } from '../util/route-utils';
import { PerformanceService } from '../services/performance.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('navbarContent') navbarContent!: ElementRef;
  @ViewChild('navbarToggler') navbarToggler!: ElementRef;
  
  currentFlagClass = "";
  languageSub: Subscription;
  activeScrollElementSub?: Subscription;
  
  getCurrentHashRoute = getCurrentHashRoute
  
  constructor(
    public themeService: ThemeService, 
    private elementRef: ElementRef, 
    public languageService: LanguageService,
    public performanceService: PerformanceService) {
    this.languageSub = this.languageService.language$.subscribe(l => {
      this.currentFlagClass = languageService.getFlagClassByLanguageCode(this.languageService.language);
    });
    
    this.activeScrollElementSub = this.performanceService.activeScrollElement$.subscribe((active) => {
      if (active === 'home') {
        this.removeActiveNavLink();
        document.querySelector('#homeNavLink')?.classList.add('active');
      } else if (active === 'resumeInfo') {
        this.removeActiveNavLink();
        document.querySelector('#resumeNavLink')?.classList.add('active');
      } else if (active === 'contactInfo') {
        this.removeActiveNavLink();
        document.querySelector('#contactNavLink')?.classList.add('active');
      }
    })
  }
  
  removeActiveNavLink(): void {
    document.querySelector('.navbar-nav li a.active')?.classList.remove('active');
  }
  
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
  
  ngOnDestroy() {
    this.languageSub?.unsubscribe;
  }
}
