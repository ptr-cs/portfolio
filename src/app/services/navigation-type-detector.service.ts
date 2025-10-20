import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationTypeDetectorService implements OnDestroy{
  public isKeyboardNavigation = false;

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      this.isKeyboardNavigation = true;
    }
  };

  private handleMousedown = () => {
    this.isKeyboardNavigation = false;
  };

  constructor() {
    try {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('mousedown', this.handleMousedown);
    } catch {}
    
    
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('mousedown', this.handleMousedown);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('mousedown', this.handleMousedown);
  }
}
