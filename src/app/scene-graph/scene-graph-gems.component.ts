import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, effect, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { injectStore, extend, NgtArgs, injectBeforeRender } from 'angular-three';
import { EXRLoader, OrbitControls } from 'three-stdlib';
import { NgtsAdaptiveDpr } from 'angular-three-soba/performances';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsBakeShadows } from 'angular-three-soba/misc';
import { Color, EquirectangularReflectionMapping, Mesh } from 'three';
import { NgtpBloom, NgtpEffectComposer } from 'angular-three-postprocessing';
import { Subscription } from 'rxjs';
import { LampService } from '../services/lamp.service';
import { Gemstone } from '../gemstone/gemstone.component';
import { getRandomColor } from '../util/three-utils';
import { ThemeService } from '../services/theme.service';
import city from '@pmndrs/assets/hdri/city.exr'
import Stats from 'stats-gl'
import { calculateGemValue, classifyGem, gemRandomFall, gemRandomPosition, gemRandomRoughness, gemRandomScale, gemRandomSpin } from '../util/gemstone-utils';
import { SettingsService } from '../services/settings.service';
import { GemsService } from '../services/gems.service';
import { PerformanceService } from '../services/performance.service';

extend({ OrbitControls });

@Component({
  template: `
    <ngt-ambient-light [intensity]="1 * Math.PI"/>
        <ngt-directional-light [position]="[-10, 0, -5]" [intensity]=".25 * Math.PI" color="white" />
        <ngt-directional-light [position]="[-1, -2, 5]" [intensity]=".75 * Math.PI" color="white" />

    @for (p of gemProperties; track $index) {
      <gemstone [position]="p.position" [color]="p.color" [roughness]="p.roughness" [rotation]="p.rotation" [scale]="p.scale" [spin]="p.spin" [fall]="p.fall" [topY]="p.topY" [valuation]="p.valuation" />
		}
    
    <ngtp-effect-composer [options]="{ multisampling: 2 }">
		<ngtp-bloom [options]="{ kernelSize: 4, luminanceThreshold: .9, luminanceSmoothing: .9, intensity: 3 }" />
    </ngtp-effect-composer>

    <ngts-orbit-controls *args="[camera(), glDomElement()]"/>
    
    <ngts-bake-shadows />
    
    <ngts-adaptive-dpr [pixelated]="true" />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Gemstone, NgtArgs, NgtsBakeShadows, NgtsOrbitControls, NgtpEffectComposer, NgtpBloom, NgtsAdaptiveDpr],
})
export class SceneGraphGems implements OnDestroy {
  GEMS_COUNT = 600;

  topY: number = 2;

  @ViewChildren(Gemstone) gemstoneComponents!: QueryList<Gemstone>;

  stats = new Stats();

  protected gemProperties: any = [];

  gemTotalValueHistory: any[] = [];

  protected readonly Math = Math;

  private store = injectStore();
  protected camera = this.store.select('camera');
  protected glDomElement = this.store.select('gl', 'domElement');
  protected invalidate = this.store.select('invalidate');
  protected scene = this.store.select('scene');
  protected gl = this.store.select('gl');

  statsGlId = "statsGlGems";

  themeSub?: Subscription;
  lampSub?: Subscription;
  needsRandomColorsUpdateSub?: Subscription;
  settingsSub?: Subscription;
  gemsSub?: Subscription;
  activeScenePausedSub?: Subscription;

  constructor(
    private themeService: ThemeService,
    private lampService: LampService,
    private settingsService: SettingsService,
    private gemsService: GemsService,
    private performanceService: PerformanceService) {

    this.stats.init(this.gl());

    const invalidate = this.invalidate();

    for (let c = 0; c < this.GEMS_COUNT; c++) {
      const scale = gemRandomScale();
      const color = getRandomColor();
      const roughness = gemRandomRoughness();
      const val = calculateGemValue(scale, color, roughness);
      this.gemProperties.push({
        'position': gemRandomPosition(),
        'rotation': [0, 0, 0],
        'scale': scale,
        'color': color,
        'roughness': roughness,
        'spin': gemRandomSpin(),
        'fall': gemRandomFall(),
        'topY': this.topY,
        'valuation': val
      })
    }

    this.gemsSub = this.gemsService.totalValueDirty$.subscribe(t => {
      if (t === true) {
        this.calculateStats();
      }
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

    this.lampSub = this.lampService.color$.subscribe(c => {
      if (this.gemstoneComponents) {
        this.gemstoneComponents.forEach(g => {
          this.setGemColor(g, c);
        });
        setTimeout(() => {
          this.calculateStats();
        }, 0)
        invalidate();
      }
    });
    
    this.needsRandomColorsUpdateSub = this.lampService.needRandomColorsUpdate$.subscribe(b => {
      if (b === true) {
        if (this.gemstoneComponents) {
        this.gemstoneComponents.forEach(g => {
          this.setGemColor(g, getRandomColor());
        });
        setTimeout(() => {
          this.calculateStats();
        }, 0)
        invalidate();
      }
      }
      this.lampService.setNeedRandomColorsUpdate(false);
     });

    injectBeforeRender(({ delta }) => {
      this.stats.update();
    });
    
    this.activeScenePausedSub = this.performanceService.activeScenePaused$.subscribe(b => {
      if (this.performanceService.activeScene === 'GEMS' && !b) {
        setTimeout(() => {
            invalidate();
          }, 0);
      }
    });
  }
  
  setGemColor(g: Gemstone, c: Color) {
    g.colorSignal.set(c);
    g.colorReadable = c;
    let m = (g.diamondObj as Mesh);
    const material = m.material;
    if ('color' in material) {
      (material as any).color.set(c);
      (material as any).needsUpdate = true;
    }
    const newValuation = calculateGemValue(g.scaleReadable, c, g.roughnessReadable);
    g.valuationSignal.set(newValuation);
    g.valuationReadable = newValuation;
  }

  ngAfterViewInit() {
    // ngts-environment seems to have a limitation (bug?) preventing usage of local hdri assets;
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

    document.querySelector("gemstones")?.appendChild(this.stats.dom);

    this.calculateStats();
  }

  private setStartView = effect(() => {
    const cam = this.camera();
    if (!cam) return;
    cam.position.set(0, -1, -4);

    cam.updateProjectionMatrix?.();
  });

  ngOnDestroy(): void {
    this.lampSub?.unsubscribe();
    this.themeSub?.unsubscribe();
    this.settingsSub?.unsubscribe();
    this.gemsSub?.unsubscribe();
    this.activeScenePausedSub?.unsubscribe();
  }

  calculateStats() {
    let totalValue = 0;
    let totalScale = 0;
    let totalRoughness = 0;
    let averageValue = 0;
    let averageScale = 0;
    let averageRoughness = 0;

    let totalDiamonds = 0;
    let totalRubies = 0;
    let totalSapphires = 0;
    let totalEmeralds = 0;
    let totalTopaz = 0;
    let totalAmethysts = 0;
    let totalUnknown = 0;
    this.gemstoneComponents.forEach((g, i) => {
      totalValue += g.valuationReadable
      totalScale += g.scaleReadable
      totalRoughness += g.roughnessReadable
      const c = classifyGem(g.colorReadable)
      if (c === 'diamond')
        totalDiamonds++;
      else if (c === 'ruby')
        totalRubies++;
      else if (c === 'emerald')
        totalEmeralds++;
      else if (c === 'sapphire')
        totalSapphires++;
      else if (c === 'topaz')
        totalTopaz++;
      else if (c === 'amethyst')
        totalAmethysts++;
      else if (c === 'unknown')
        totalUnknown++;
    })
    averageValue = totalValue / this.GEMS_COUNT;
    averageScale = totalScale / this.GEMS_COUNT;
    averageRoughness = totalRoughness / this.GEMS_COUNT;

    let distribution = [totalDiamonds, totalRubies, totalEmeralds, totalSapphires, totalTopaz, totalAmethysts];

    this.gemsService.setTotalValue(totalValue);
    this.gemsService.setAverageValue(averageValue);
    this.gemsService.setAverageScale(averageScale);
    this.gemsService.setAverageRoughness(averageRoughness);
    this.gemsService.setTotalValueDirty(false);
    this.gemsService.setDistribution(distribution);
    
    if (totalValue > 0)
      this.gemTotalValueHistory.push(totalValue);
    if (this.gemTotalValueHistory.length > 20)
      this.gemTotalValueHistory.shift();
    
    this.gemsService.setTotalValueHistory(this.gemTotalValueHistory);
  }
}