import { ElementRef } from '@angular/core';
import { ScrollIntoViewOnFocusDirective } from './scroll-into-view-on-focus.directive';
import { NavigationTypeDetectorService } from '../services/navigation-type-detector.service';
import { PerformanceService } from '../services/performance.service';

describe('ScrollIntoViewOnFocusDirective', () => {
  let directive: ScrollIntoViewOnFocusDirective;
  let navigationService: NavigationTypeDetectorService;
  let performanceService: PerformanceService;
  let nativeElement: HTMLElement;

  beforeEach(() => {
    navigationService = { isKeyboardNavigation: false } as NavigationTypeDetectorService;
    performanceService = jasmine.createSpyObj<PerformanceService>('PerformanceService', ['setActiveScene']);
    nativeElement = document.createElement('div');
    const elementRef = new ElementRef(nativeElement);
    directive = new ScrollIntoViewOnFocusDirective(elementRef, navigationService, performanceService);
  });

  it('should scroll into view when keyboard navigation is active', () => {
    const scrollSpy = spyOn(nativeElement, 'scrollIntoView');
    navigationService.isKeyboardNavigation = true;

    directive.onFocus(new FocusEvent('focus'));

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'end' });
  });

  it('should trigger active scene change for lavaLampWall', () => {
    const scrollSpy = spyOn(nativeElement, 'scrollIntoView');
    navigationService.isKeyboardNavigation = true;
    nativeElement.id = 'lavaLampWall';

    directive.onFocus(new FocusEvent('focus'));

    expect(scrollSpy).toHaveBeenCalled();
    expect(performanceService.setActiveScene).toHaveBeenCalledWith('LAVA_WALL');
  });

  it('should do nothing when navigation is not keyboard-based', () => {
    const scrollSpy = spyOn(nativeElement, 'scrollIntoView');

    directive.onFocus(new FocusEvent('focus'));

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(performanceService.setActiveScene).not.toHaveBeenCalled();
  });
});
