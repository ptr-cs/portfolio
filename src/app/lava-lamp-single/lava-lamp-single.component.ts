import {
  Component, ElementRef, signal, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgtCanvas, extend } from 'angular-three';
import * as THREE from 'three';
import { SceneGraphSingle } from '../scene-graph/scene-graph-single.component';
import { PerformanceService } from '../services/performance.service';
import { SceneSettingsComponent } from '../scene-settings/scene-settings.component';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
extend(THREE);

@Component({
  selector: 'lava-lamp-single',
  templateUrl: './lava-lamp-single.component.html',
  styleUrls: ['./lava-lamp-single.component.scss'],
  imports: [NgtCanvas, SceneSettingsComponent, CommonModule]
})
export class LavaLampSingleComponent {  
  protected sceneGraph = SceneGraphSingle;
  
  frameloop = signal<'always' | 'demand'>('demand');

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  
  background = new THREE.Color(0xffffff);
  
  performanceSub?: Subscription;
    
  constructor(public performanceService: PerformanceService, private settingsService: SettingsService) {}
  
  ngAfterViewInit() {
    this.performanceSub = this.performanceService.activeScene$.subscribe(s => {
      if (s === "LAVA_SINGLE")
        this.frameloop.set("always");
      else
        this.frameloop.set("demand")
     });
  }
  
  ngOnDestroy() {
    this.performanceSub?.unsubscribe();
  }
}