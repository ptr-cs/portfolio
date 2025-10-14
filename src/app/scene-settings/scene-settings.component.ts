import { Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, EMPTY, fromEvent, merge, share, startWith, Subscription, switchMap, tap } from 'rxjs';
import { getDefaultTheme, Theme, ThemeService } from '../services/theme.service';
import { LampService } from '../services/lamp.service';
import { Quality, QualityService } from '../services/quality.service';
import { PerformanceService } from '../services/performance.service';
import { Color } from 'three';
import { MiniColorPickerComponent } from '../util/mini-color-picker/mini-color-picker';
import { FormsModule } from '@angular/forms'; 
import { MatTooltip } from '@angular/material/tooltip';
import { OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { SettingsService } from '../services/settings.service';
import { getRandomColor } from '../util/three-utils';
import { exitFullscreen, getFullscreenElement, requestFullscreen } from '../util/fullscreen-utils';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

let uid = 0;
@Component({
    selector: 'app-scene-settings',
    templateUrl: './scene-settings.component.html',
    styleUrls: ['./scene-settings.component.scss'],
    standalone: true,
    imports: [FormsModule, MatTooltip, MiniColorPickerComponent, CommonModule],
    providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }]
})
export class SceneSettingsComponent implements OnDestroy {
    readonly SETTINGS_DISMISS_VIA_TOUCH_BREAKPOINT = 768;

    theme: Theme = getDefaultTheme();
    quality?: Quality;

    showPicker = false;
    autohide = false;
    displayStats = true;

    isCollapsed = false;
    
    fullscreenActive = false;

    private readonly autohide$ = new BehaviorSubject<boolean>(this.autohide);
    private autohideSub?: Subscription;
    private qualitySub?: Subscription;
    private settingsSub?: Subscription;
    private settingsCloseSub?: Subscription;
    private colorSub?: Subscription;
    private customColorSub?: Subscription;
    private fullscreenSub?: Subscription;

    private timesColorPickerToggled = 0;
    settingsOpen = false;
                
    @Input() panelId?: string;
    @Input() labelId?: string;
    @Input() schemeLightId?: string;
    @Input() schemeDarkId?: string;
    @Input() fullScreenTargetQuerySelector?: string;
    readonly uid = uid;
    readonly groupName = `${uid}-group`;
    readonly lightId = `${uid}-light`;
    readonly darkId = `${uid}-dark`;
    
    @ViewChild('settingsToggleButtonOuter', { static: true }) settingsToggleButtonOuter!: ElementRef;
    @ViewChild('minicolorpicker', { static: true }) minicolorpicker!: MiniColorPickerComponent;

    constructor(private readonly zone: NgZone,
        private readonly renderer: Renderer2,
        public readonly themeService: ThemeService,
        private readonly performanceService: PerformanceService,
        public readonly lampService: LampService,
        public readonly qualityService: QualityService,
        public readonly settingsService: SettingsService,
        private elementRef: ElementRef,
        public languageService: LanguageService) { }
        
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInsideNavbar = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInsideNavbar && this.areSettingsOpen() === true) {
      this.settingsToggleButtonOuter.nativeElement.click();
    }
  }

  private areSettingsOpen(): boolean | null {
    const lampControls = document.querySelector('.lamp-controls-ui')
    if (lampControls) {
      return lampControls.classList.contains("show");
    }
    return null;
  }

    ngOnInit(): void {
        this.theme = this.themeService.theme;

        this.quality = this.qualityService.quality;

        this.qualitySub = this.qualityService.quality$.pipe(distinctUntilChanged())
            .subscribe(v => (this.quality = v)
          );
            
        this.settingsSub = this.settingsService.displayStats$.subscribe(s => {
          this.displayStats = s;
        });
        
        this.panelId ??= `lampControlsInterface-${++uid}`;
        this.labelId ??= `lampControlsLabel-${++uid}`;
        this.schemeLightId ?? `scheme-light-${++uid}`
        this.schemeDarkId ?? `scheme-dark-${++uid}`
    }

    ngAfterViewInit() {
        const btn = this.settingsToggleButtonOuter.nativeElement;
        const show = () => this.renderer.removeClass(btn, 'is-hidden');
        const hide = () => this.renderer.addClass(btn, 'is-hidden');

        this.zone.runOutsideAngular(() => {
            const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointermove', 'wheel'];
            const activity$ = merge(...activityEvents.map(e => fromEvent(document, e))).pipe(share());

            this.autohideSub = this.autohide$
                .pipe(
                    switchMap(on => {
                        if (!on) {
                            show();
                            return EMPTY;
                        }
                        return activity$.pipe(startWith(null), tap(show), debounceTime(2000));
                    })
                )
                .subscribe(() => hide());
        });
        
        setTimeout(() => {
          this.setBarHex(`#${this.lampService.customColor.getHexString()}`);
        })
        
        this.colorSub = this.lampService.color$.subscribe(c => {
          if (this.minicolorpicker) {
            let hex = `#${c.getHexString()}`;
            let hue = this.minicolorpicker.hexToHue(hex);
            this.minicolorpicker.applyHue(hue);
          }
         });
         
         this.customColorSub = this.lampService.customColor$.subscribe(c => {
          this.setBarHex(`#${c.getHexString()}`);
         });
         
         this.fullscreenSub = this.settingsService.fullscreenActive$.subscribe(a => {
          this.fullscreenActive = a;
         });
    }
    
    onThemeChange(next: Theme): void {
    this.theme = next;
    this.themeService.apply(next);
  }

  onLavaColorChange(next: any): void {
    this.lampService.setType(next);
    if (next === 'custom') {
      this.timesColorPickerToggled = 1;
      this.onLavaHex(this.lampService.customColor);
    }
  }

  onQualityChange(next: Quality): void {
    this.quality = next;
    this.qualityService.setQuality(next);
  }
  
  onLavaHex(hex: any): void {
    if (this.timesColorPickerToggled < 1) return;

    let hexStr = hex;
    if (hex instanceof Color) {
      hexStr = hex.getHexString();
    } else {
      hexStr = hex.startsWith('#') ? hex : `#${hex}`;
    }

    this.lampService.setCustomColor(hexStr);
    
    let barHex = hexStr;
    if (!barHex.startsWith("#"))
      barHex = "#" + barHex;

    this.setBarHex(barHex);
  }
  
  setBarHex(barHex: string) {
    const bar = document.querySelector<HTMLDivElement>('#lavaCustomColorLabel .color-button-bar');
    if (bar) bar.style.setProperty('--lamp-lava-custom-color', barHex);
  }

  togglePicker(): void {
    this.showPicker = !this.showPicker;
    this.timesColorPickerToggled++;
  }

  onRotateChange(rotate: boolean): void {
    this.lampService.setRotate(rotate);
  }

    ngOnDestroy(): void {
        this.autohideSub?.unsubscribe();
        this.qualitySub?.unsubscribe();
        this.settingsSub?.unsubscribe();
        this.settingsCloseSub?.unsubscribe();
        this.colorSub?.unsubscribe();
        this.customColorSub?.unsubscribe();
        this.fullscreenSub?.unsubscribe();
    }
    
    onAutoHideChange(next: boolean): void {
    this.autohide = next;
    this.autohide$.next(next);
  }
  
  onDisplayStatsChange(next: boolean): void {
    this.settingsService.setDisplayStats(next);
    this.displayStats = this.settingsService.displayStats;
  }

  toggleFullscreen(): void {
    const host = document.querySelector(this.fullScreenTargetQuerySelector!) as HTMLElement;
    if (!host) return;

    if (getFullscreenElement()) {
      exitFullscreen();
    } else {
      requestFullscreen(host);
    }
  }
  
  randomColor() {
    const c = getRandomColor();
    this.lampService.setCustomColor(c.getHexString());
    this.lampService.setType('custom');
    this.lampService.setType('none');
    this.lampService.setNeedRandomColorsUpdate(true);
  }
  
}