import { Directive, HostListener, ElementRef } from '@angular/core';
import { NavigationTypeDetectorService } from '../services/navigation-type-detector.service';
import { PerformanceService } from '../services/performance.service';

@Directive({
  selector: '[scrollIntoViewOnFocus]'
})
export class ScrollIntoViewOnFocusDirective {
  constructor(private el: ElementRef, private navigationTypeDetectorService: NavigationTypeDetectorService, private performanceService: PerformanceService) {}

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.navigationTypeDetectorService.isKeyboardNavigation) {
      this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      if (this.el.nativeElement.id === "lavaLampWall") { 
        this.performanceService.setActiveScene('LAVA_WALL');
      }
    }
  }
}