import {
  Component, ElementRef, signal, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgtCanvas, extend } from 'angular-three';
import * as THREE from 'three';
import { SceneGraphGems } from '../scene-graph/scene-graph-gems.component';
import { PerformanceService } from '../services/performance.service';
import { SceneSettingsComponent } from '../scene-settings/scene-settings.component';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
extend(THREE);

@Component({
  selector: 'gemstones',
  templateUrl: './gemstones.component.html',
  styleUrls: ['./gemstones.component.scss'],
  imports: [NgtCanvas, SceneSettingsComponent, CommonModule],
})
export class GemstonesComponent {  
  protected sceneGraph = SceneGraphGems;
  
  frameloop = signal<'always' | 'demand'>('demand');

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  @ViewChild(NgtCanvas) private canvas!: any;

  private observer!: IntersectionObserver;
  
  activeSceneSub?: Subscription;
  activeScenePausedSub?: Subscription;
  
  constructor(public performanceService: PerformanceService, private settingsService: SettingsService) {
  }
  
  ngAfterViewInit() {
    this.activeSceneSub = this.performanceService.activeScene$.subscribe(s => {
      if (s === "GEMS")
        this.frameloop.set("always");
      else
        this.frameloop.set("demand");
     });
     
     this.activeScenePausedSub = this.performanceService.activeScenePaused$.subscribe(b => {
      if (this.performanceService.activeScene === "GEMS") {
        if (b) {
          this.frameloop.set('demand');
        } else {
          this.frameloop.set('always');
        }
      }
     });
  }

  ngOnDestroy(): void {
    if (this.observer && this.canvasContainer?.nativeElement) {
      this.observer.unobserve(this.canvasContainer.nativeElement);
    }
    
    this.activeSceneSub?.unsubscribe();
    this.activeScenePausedSub?.unsubscribe();
  }

  areSettingsOpen(): boolean {
    const lampControls = document.querySelector('.lamp-controls-ui')
    if (lampControls) {
      return lampControls.classList.contains("show");
    }
    return false;
  }
}