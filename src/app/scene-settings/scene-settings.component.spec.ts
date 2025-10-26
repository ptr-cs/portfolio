import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SceneSettingsComponent } from './scene-settings.component';
import { ThemeService, Theme } from '../services/theme.service';
import { PerformanceService } from '../services/performance.service';
import { LampService } from '../services/lamp.service';
import { SettingsService } from '../services/settings.service';
import { LanguageService } from '../services/language.service';
import { Color } from 'three';

@Component({
  selector: 'app-mini-color-picker',
  standalone: true,
  template: ''
})
class MiniColorPickerStubComponent {
  applyHue(): void {}
  hexToHue(): number {
    return 0;
  }
}

describe('SceneSettingsComponent', () => {
  let fixture: ComponentFixture<SceneSettingsComponent>;
  let component: SceneSettingsComponent;

  const themeApplySpy = jasmine.createSpy('apply');
  const themeService: Partial<ThemeService> = {
    theme: 'dark' as Theme,
    apply: themeApplySpy
  };

  const colorSubject = new BehaviorSubject<Color>(new Color('#ffffff'));
  const customColorSubject = new BehaviorSubject<Color>(new Color('#000000'));
  const lampService: Partial<LampService> = {
    color$: colorSubject.asObservable(),
    customColor$: customColorSubject.asObservable(),
    customColor: new Color('#000000'),
    setType: jasmine.createSpy('setType'),
    setCustomColor: jasmine.createSpy('setCustomColor'),
    setNeedRandomColorsUpdate: jasmine.createSpy('setNeedRandomColorsUpdate')
  };

  const activeSceneSubject = new BehaviorSubject<'LAVA_SINGLE' | 'LAVA_WALL' | 'GEMS' | 'NONE'>('LAVA_SINGLE');
  const activeScenePausedSubject = new BehaviorSubject<boolean>(false);
  const performanceSetSceneSpy = jasmine.createSpy('setActiveScene');
  const performanceSetPausedSpy = jasmine.createSpy('setActiveScenePaused');
  const performanceService: Partial<PerformanceService> = {
    activeScene$: activeSceneSubject.asObservable(),
    activeScenePaused$: activeScenePausedSubject.asObservable(),
    get activeScene() {
      return activeSceneSubject.value;
    },
    get activeScenePaused() {
      return activeScenePausedSubject.value;
    },
    setActiveScene: performanceSetSceneSpy,
    setActiveScenePaused: performanceSetPausedSpy
  };

  const displayStatsSubject = new BehaviorSubject<boolean>(true);
  const fullscreenSubject = new BehaviorSubject<boolean>(false);
  let accessibilityControls = false;
  const setDisplayStatsSpy = jasmine.createSpy('setDisplayStats').and.callFake((next: boolean) => {
    displayStatsSubject.next(next);
  });
  const setDisplayAccessibilityControlsSpy = jasmine
    .createSpy('setDisplayAccessibilityControls')
    .and.callFake((next: boolean) => {
      accessibilityControls = next;
    });
  const settingsService: Partial<SettingsService> = {
    displayStats$: displayStatsSubject.asObservable(),
    fullscreenActive$: fullscreenSubject.asObservable(),
    get displayStats() {
      return displayStatsSubject.value;
    },
    get displayAccessibilityControls() {
      return accessibilityControls;
    },
    setDisplayStats: setDisplayStatsSpy,
    setDisplayAccessibilityControls: setDisplayAccessibilityControlsSpy,
    notifyRotateScene: jasmine.createSpy('notifyRotateScene'),
    notifyZoomScene: jasmine.createSpy('notifyZoomScene'),
    setFullscreenActive: jasmine.createSpy('setFullscreenActive')
  };

  const languageService: Partial<LanguageService> = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneSettingsComponent],
      providers: [
        { provide: ThemeService, useValue: themeService },
        { provide: PerformanceService, useValue: performanceService },
        { provide: LampService, useValue: lampService },
        { provide: SettingsService, useValue: settingsService },
        { provide: LanguageService, useValue: languageService }
      ]
    })
      .overrideComponent(SceneSettingsComponent, {
        set: {
          template: `
            <button #settingsToggleButton></button>
            <app-mini-color-picker #minicolorpicker></app-mini-color-picker>
          `,
          imports: [MiniColorPickerStubComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SceneSettingsComponent);
    component = fixture.componentInstance;
    component.fullScreenTargetQuerySelector = 'body';
    fixture.detectChanges();
  });

  afterEach(() => {
    themeApplySpy.calls.reset();
    setDisplayStatsSpy.calls.reset();
    setDisplayAccessibilityControlsSpy.calls.reset();
    performanceSetSceneSpy.calls.reset();
    performanceSetPausedSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply theme changes', () => {
    component.onThemeChange('light');
    expect(themeApplySpy).toHaveBeenCalledWith('light');
    expect(component.theme).toBe('light');
  });

  it('should update autohide state', () => {
    component.onAutoHideChange(true);
    expect(component.autohide).toBeTrue();

    component.onAutoHideChange(false);
    expect(component.autohide).toBeFalse();
  });

  it('should update display stats setting', () => {
    component.onDisplayStatsChange(false);
    expect(setDisplayStatsSpy).toHaveBeenCalledWith(false);
    expect(component.displayStats).toBe(settingsService.displayStats ?? false);
  });

  it('should pause and resume scene', () => {
    activeScenePausedSubject.next(false);
    component.pauseScene();
    expect(performanceSetPausedSpy).toHaveBeenCalledWith(true);
    expect(component.previouslyPlayedScene).toBe('LAVA_SINGLE');

    performanceSetPausedSpy.calls.reset();
    performanceSetSceneSpy.calls.reset();

    activeScenePausedSubject.next(true);
    component.pauseScene();
    expect(performanceSetSceneSpy).toHaveBeenCalledWith('LAVA_SINGLE');
    expect(performanceSetPausedSpy).toHaveBeenCalledWith(false);
  });
});
