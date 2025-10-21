import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, effect, ViewChild, ViewChildren, QueryList, viewChild } from '@angular/core';
import { injectStore, extend, NgtArgs, injectBeforeRender, NgtSpotLight } from 'angular-three';
import { OrbitControls } from 'three-stdlib';
import { LavaLamp } from '../lava-lamp/lava-lamp.component';
import { NgtsAdaptiveDpr } from 'angular-three-soba/performances';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsBakeShadows } from 'angular-three-soba/misc';
import { Color, SpotLight } from 'three';
import { NgtpBloom, NgtpEffectComposer } from 'angular-three-postprocessing';
import { LampService } from '../services/lamp.service';
import { Subscription } from 'rxjs';
import { getRandomColor } from '../util/three-utils';
import { PerformanceService } from '../services/performance.service';
import { ThemeService } from '../services/theme.service';
import Stats from 'stats-gl'
import { SettingsService } from '../services/settings.service';

extend({ OrbitControls });

@Component({
    template: `
    <ngt-ambient-light [intensity]="1 * Math.PI"/>
		<ngt-directional-light [position]="[-10, 0, -5]" [intensity]="1.5 * Math.PI" color="white" />
		<ngt-directional-light [position]="[-1, -2, 5]" [intensity]="3 * Math.PI" color="white" />
    <ngt-spot-light #light
            [position]="[5, 0, 5]"
            [intensity]="1"
            [penumbra]="1"
            [angle]="0.35"
            [decay]="0"
            [castShadow]="false"
            color="#0c8cbf"
        />
    
    @for (p of positions; track $index) {
      <lava-lamp [position]="p.position" [color]="p.color" [rotation.y]="-1.9" [waxMatEmissiveIntensity]="5" [waxResolution]="11" [waxIsolation]="32" [waxEnableColors]="false" [waxMaxPolygons]="1000" [limitUpdates]="false" [waxBoundsTopOffset]="-.1"/>
		}
    
    <ngtp-effect-composer [options]="{ multisampling: 0 }">
			<ngtp-bloom [options]="{ kernelSize: 3, luminanceThreshold: .9, luminanceSmoothing: .9, intensity: .75 }" />
    </ngtp-effect-composer>
    
    <ngts-orbit-controls #controls *args="[camera(), glDomElement()]" />
    
		<ngts-bake-shadows />
    
    <ngts-adaptive-dpr [pixelated]="true" />
  `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LavaLamp, NgtArgs, NgtsBakeShadows, NgtsOrbitControls, NgtpEffectComposer, NgtpBloom, NgtsAdaptiveDpr ],
})
export class SceneGraphWall {
  
  @ViewChild('controls', { static: true }) controlsComp!: OrbitControls;
  
  @ViewChildren(LavaLamp) lavaLampComponents!: QueryList<LavaLamp>;
  
    protected readonly Math = Math;
    
    private store = injectStore();
    protected camera = this.store.select('camera');
    protected glDomElement = this.store.select('gl', 'domElement');
    protected gl = this.store.select('gl');
    protected invalidate = this.store.select('invalidate');
    protected scene = this.store.select('scene');
    
    cameraControlsRef = viewChild.required(NgtsOrbitControls);
    
    protected positions: any = [];
    rows = 5;
    cols = 5;
    spacingX = .9;
    spacingY = 1.1;
    
    private lampSub?: Subscription;
    private settingsSub?: Subscription;
    private activeScenePausedSub?: Subscription;

    widthX = (this.cols - 1) * this.spacingX;
    heightY = (this.rows - 1) * this.spacingY;
    x0 = -this.widthX / 2;
    y0 = -this.heightY / 2;
    
    themeSub?: Subscription;
    needsRandomColorsUpdateSub?: Subscription;
    private rotateCameraSub?: Subscription;
    private zoomCameraSub?: Subscription;
    
    orbitControls?: OrbitControls;
    
    stats = new Stats();
    
    statsGlId = "statsGlWall";
    
    @ViewChild('light') lightRef?: NgtSpotLight;
    
    constructor(
      private lampService: LampService, 
      private performanceService: PerformanceService, 
      private themeService: ThemeService,
      private settingsService: SettingsService) {
      
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          let randomColor = getRandomColor()
          this.positions.push({'position': [this.x0 + c * this.spacingX, this.y0 + r * this.spacingY, 0], 'color': randomColor})
        }
      }
      
      
      const invalidate = this.invalidate();
      
      this.lampSub = this.lampService.color$.subscribe(c => {
          if (this.lightRef && this.lampService.type !== 'none')
            ((this.lightRef as any).nativeElement as SpotLight).color = this.lampService.color;
          invalidate();
        });
      
      this.themeSub = this.themeService.theme$.subscribe(t => {
        let s = this.scene();
        if (s) {
          if (t === 'light') {
            s.background = new Color(0xeeeeee);
          }
          else
            s.background = this.themeService.colorDark;
        }
        invalidate();
      });
      
      this.settingsSub = this.settingsService.displayStats$.subscribe(s => {
        let stats = document.querySelector("#" + this.statsGlId);
        if (!stats) return;
        if (s === true) 
          (stats as any)!.classList.add("show");
        else 
          (stats as any)!.classList.remove("show");
      });
      
      this.needsRandomColorsUpdateSub = this.lampService.needRandomColorsUpdate$.subscribe(b => {
      if (b === true) {
        if (this.lavaLampComponents) {
        this.lavaLampComponents.forEach(l => {
          l.resetColors(getRandomColor());
        });
        invalidate();
      }
      }
      this.lampService.setNeedRandomColorsUpdate(false);
     });
     
     this.activeScenePausedSub = this.performanceService.activeScenePaused$.subscribe(b => {
      if (this.performanceService.activeScene === 'LAVA_WALL' && !b) {
        setTimeout(() => {
            invalidate();
          }, 0);
      }
     });
     
     this.rotateCameraSub = this.settingsService.rotateScene$.subscribe(action => {
        if (this.performanceService.activeScene !== 'LAVA_WALL') return;
        if (!this.orbitControls) return;
        const angleStep = 1;
        const currentAzimuthal = this.orbitControls.getAzimuthalAngle();
        const currentPolar = this.orbitControls.getPolarAngle();
        if (action === 'rotate-left') {
          this.orbitControls.setAzimuthalAngle(currentAzimuthal + angleStep);
        } else if (action === 'rotate-right') {
          this.orbitControls.setAzimuthalAngle(currentAzimuthal - angleStep);
        } else if (action === 'rotate-up') {
          this.orbitControls.setPolarAngle(currentPolar - angleStep/2);
        } else if (action === 'rotate-down') {
          this.orbitControls.setPolarAngle(currentPolar + angleStep/2);
        }

        this.orbitControls.update();
      });
      
      this.zoomCameraSub = this.settingsService.zoomScene$.subscribe(action => {
        if (this.performanceService.activeScene !== 'LAVA_WALL') return;
        if (!this.orbitControls) return;
        const zoomStep = 1.1;
        if (action === 'zoom-in') {
          this.orbitControls.dollyOut(zoomStep);
        } else if (action === 'zoom-out') {
          this.orbitControls.dollyIn(zoomStep);
        }

        this.orbitControls.update();
      });
      
      this.stats.init( this.gl() );
      
      injectBeforeRender(({ delta }) => {
        this.stats.update();
      });
  }
  
  ngOnDestroy(): void {
    this.lampSub?.unsubscribe();
    this.settingsSub?.unsubscribe();
    this.activeScenePausedSub?.unsubscribe();
    this.needsRandomColorsUpdateSub?.unsubscribe();
    this.rotateCameraSub?.unsubscribe();
    this.zoomCameraSub?.unsubscribe();
  }
  
  ngAfterViewInit(): void {
    this.stats.dom.style.right = "200px";
      this.stats.dom.style.left = "unset";
      this.stats.dom.style.position = "absolute";
      this.stats.dom.style.zIndex = "0";
      this.stats.dom.style.opacity = "";
      this.stats.dom.classList.add("fade", "show");
      this.stats.dom.id = this.statsGlId;
      
      document.querySelector("lava-lamp-wall")?.appendChild( this.stats.dom );
      
      const controls = this.cameraControlsRef().controls() as OrbitControls;
      if (controls) {
        this.orbitControls = controls;
      }
  }
  
  private setStartView = effect(() => {
        const cam = this.camera();
        if (!cam) return;
        cam.position.set(0, -0.25, 4);
        cam.updateProjectionMatrix?.();
    });
    
    
}