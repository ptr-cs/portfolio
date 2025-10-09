import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, effect, ViewChild } from '@angular/core';
import { injectStore, extend, NgtArgs, injectBeforeRender, NgtSpotLight } from 'angular-three';
import { EXRLoader, OrbitControls } from 'three-stdlib';
import { LavaLamp } from '../lava-lamp/lava-lamp.component';
import { NgtsAdaptiveDpr } from 'angular-three-soba/performances';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsBakeShadows } from 'angular-three-soba/misc';
import { Color, EquirectangularReflectionMapping, SpotLight } from 'three';
import { NgtpBloom, NgtpEffectComposer } from 'angular-three-postprocessing';
import { Subscription } from 'rxjs';
import { LampService } from '../services/lamp.service';
import { PerformanceService } from '../services/performance.service';
import { ThemeService } from '../services/theme.service';
import city from '@pmndrs/assets/hdri/city.exr'
import Stats from 'stats-gl'
import { SettingsService } from '../services/settings.service';

extend({ OrbitControls });

@Component({
    template: `
    <ngt-ambient-light [intensity]="1 * Math.PI"/>
        <ngt-directional-light [position]="[-10, 0, -5]" [intensity]=".25 * Math.PI" color="white" />
        <ngt-directional-light [position]="[-1, -2, 5]" [intensity]=".75 * Math.PI" color="white" />
        <ngt-spot-light #light
            [position]="[5, 0, 5]"
            [intensity]=".5"
            [penumbra]="1"
            [angle]="0.35"
            [decay]="0"
            [castShadow]="false"
            color="#00b5a9"
        />
    <ngts-center>
        <lava-lamp [rotation.y]="-1.9" [position]="[0,-.2,0]"/>
    </ngts-center>
    
    <ngtp-effect-composer [options]="{ multisampling: 2 }">
			<ngtp-bloom [options]="{ kernelSize: 4, luminanceThreshold: 0.6, luminanceSmoothing: 0.9, intensity: 2.5 }" />
    </ngtp-effect-composer>

    <ngts-orbit-controls #orbitControls *args="[camera(), glDomElement()]"/>
    
    <ngts-bake-shadows />
    
    <ngts-adaptive-dpr [pixelated]="true" />
    
    
  `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LavaLamp, NgtArgs, NgtsBakeShadows, NgtsOrbitControls, NgtpEffectComposer, NgtpBloom, NgtsAdaptiveDpr],
})
export class SceneGraphSingle {
    protected readonly Math = Math;
    
    private store = injectStore();
    protected camera = this.store.select('camera');
    protected glDomElement = this.store.select('gl', 'domElement');
    protected gl = this.store.select('gl');
    protected invalidate = this.store.select('invalidate');
    protected scene = this.store.select('scene');
    
    private lampSub?: Subscription;
    private performanceSub?: Subscription;
    private settingsSub?: Subscription;
    private themeSub?: Subscription;
    
    stats = new Stats();
    
    statsGlId = "statsGlSingle";
    
    @ViewChild('light') lightRef?: NgtSpotLight;
    @ViewChild('orbitControls') orbitControls?: any;
    
    private setStartView = effect(() => {
        const cam = this.camera();
        if (!cam) return;
        cam.position.set(0, 0, .9);
        cam.updateProjectionMatrix?.();
    });
    
    constructor(
      private lampService: LampService, 
      private performanceService: PerformanceService, 
      private themeService: ThemeService,
      private settingsService: SettingsService) {
      this.lampSub = this.lampService.color$.subscribe(c => {
        if (this.lightRef)
          ((this.lightRef as any).nativeElement as SpotLight).color = this.lampService.color;
      });
      
      this.stats.init( this.gl() );
      
      const invalidate = this.invalidate();
      
      this.themeSub = this.themeService.theme$.subscribe(t => {
        let s = this.scene();
        if (s) {
          if (t === 'light') {
            s.background = new Color(0xdfdfdf);
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
      
      injectBeforeRender(({ delta }) => {
        this.stats.update();
      });
    }
    
    nudgeControls() {
      const cam = this.camera();
      if (!cam) return;
      // cam.position.set(0, 0, .9);
      cam.updateProjectionMatrix?.();
    }
    
    ngAfterViewInit() {
      // ngts-environment seems to have a bug preventing usage of local hdri assets;
      // as a workaround, use an EXRLoader to dynamically load an hdri from local pmndrs library
      new EXRLoader().load(city, (texture) => {
        texture.mapping = EquirectangularReflectionMapping
        this.scene().environment = texture
      });
      
      this.stats.dom.style.right = "200px";
      this.stats.dom.style.left = "unset";
      this.stats.dom.style.position = "absolute";
      this.stats.dom.style.zIndex = "0";
      this.stats.dom.style.opacity = "";
      this.stats.dom.classList.add("fade", "show");
      this.stats.dom.id = this.statsGlId;
      
      document.querySelector("lava-lamp-single")?.appendChild( this.stats.dom );
    }
    
    ngOnDestroy(): void {
      this.lampSub?.unsubscribe();
      this.performanceSub?.unsubscribe();
    }
  }