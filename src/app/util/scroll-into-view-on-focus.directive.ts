import { Directive, HostListener, ElementRef } from '@angular/core';
import { NavigationTypeDetectorService } from '../services/navigation-type-detector.service';

@Directive({
  selector: '[scrollIntoViewOnFocus]'
})
export class ScrollIntoViewOnFocusDirective {
  constructor(private el: ElementRef, private navigationTypeDetectorService: NavigationTypeDetectorService) {}

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.navigationTypeDetectorService.isKeyboardNavigation) {
      this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}