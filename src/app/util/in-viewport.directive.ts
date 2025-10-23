import {
  Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output
} from '@angular/core';
import { PerformanceService } from '../services/performance.service';
import { getFullscreenElement } from './fullscreen-utils';

@Directive({
  selector: '[inViewport]',
  standalone: true,
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input() root: HTMLElement | null = null;
  @Input() threshold: number | number[] = 0.25;
  @Input() rootMargin = '0px';

  @Output() intersect = new EventEmitter<IntersectionObserverEntry>();
  @Output() inViewportChange = new EventEmitter<boolean>();
  @Output() entered = new EventEmitter<void>();
  @Output() exited = new EventEmitter<void>();

  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone, private performanceService: PerformanceService) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.io = new IntersectionObserver((entries) => {
          if (getFullscreenElement()) return;
          const entry = entries[0];
          const inView = entry.isIntersecting && entry.intersectionRatio > 0;
          this.intersect.emit(entry);
          if (inView) {
            if (entry.target.id === "home") {
              this.performanceService.setActiveScene("LAVA_SINGLE") 
              this.performanceService.setActiveScenePaused(false);
            } else if (entry.target.id === "lavaLampWall") {
              this.performanceService.setActiveScene("LAVA_WALL")
              this.performanceService.setActiveScenePaused(false);
            } else if (entry.target.id === "gemstones") {
              this.performanceService.setActiveScene("GEMS")
              if (this.performanceService.pausedFromGemsDash === false)
                this.performanceService.setActiveScenePaused(false);
            }
            this.inViewportChange.emit(true);
            this.entered.emit();
          } else {
            this.inViewportChange.emit(false);
            this.exited.emit();
          }
        }, {
          root: this.root,
          rootMargin: this.rootMargin,
          threshold: this.threshold,
        });

        this.io.observe(this.el.nativeElement);
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
