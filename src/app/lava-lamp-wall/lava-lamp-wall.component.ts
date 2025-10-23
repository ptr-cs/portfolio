import {
  Component, ElementRef, signal, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgtCanvas, extend } from 'angular-three';
import * as THREE from 'three';
import { SceneGraphWall } from '../scene-graph/scene-graph-wall.component';
import { PerformanceService } from '../services/performance.service';
import { SceneSettingsComponent } from '../scene-settings/scene-settings.component';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
extend(THREE);

@Component({
  selector: 'lava-lamp-wall',
  templateUrl: './lava-lamp-wall.component.html',
  styleUrls: ['./lava-lamp-wall.component.scss'],
  imports: [NgtCanvas, SceneSettingsComponent, CommonModule]
})
export class LavaLampWallComponent {  
  protected sceneGraph = SceneGraphWall;
  
  frameloop = signal<'always' | 'demand'>('demand');
  
    @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
    
    activeSceneSub?: Subscription;
    activeScenePausedSub?: Subscription;

    constructor(public performanceService: PerformanceService, private settingsService: SettingsService) {}
  
  ngAfterViewInit() {
    this.activeSceneSub = this.performanceService.activeScene$.subscribe(s => {
      if (s === "LAVA_WALL")
        this.frameloop.set("always");
      else
        this.frameloop.set("demand")
     });
     
     this.activeScenePausedSub = this.performanceService.activeScenePaused$.subscribe(paused => {
      if (this.performanceService.activeScene === 'LAVA_WALL') {
        if (paused) {
          this.frameloop.set("demand");
        } else {
          this.frameloop.set("always");
        }
      }
     });
  }
  
  ngOnDestroy() {
    this.activeSceneSub?.unsubscribe();
    this.activeScenePausedSub?.unsubscribe();
  }
}