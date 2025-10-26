import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { LavaLampWallComponent } from './lava-lamp-wall.component';
import { PerformanceService } from '../../services/performance.service';
import { SettingsService } from '../../services/settings.service';

describe('LavaLampWallComponent', () => {
  let fixture: ComponentFixture<LavaLampWallComponent>;
  let component: LavaLampWallComponent;

  const activeSceneSubject = new BehaviorSubject<string>('NONE');
  const activeScenePausedSubject = new BehaviorSubject<boolean>(false);

  const mockPerformanceService = {
    activeScene$: activeSceneSubject.asObservable(),
    activeScenePaused$: activeScenePausedSubject.asObservable(),
    get activeScene() {
      return activeSceneSubject.value;
    },
    setActiveScene: jasmine.createSpy('setActiveScene'),
    setActiveScenePaused: jasmine.createSpy('setActiveScenePaused')
  } as Partial<PerformanceService> as PerformanceService;

  const mockSettingsService = {} as SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LavaLampWallComponent],
      providers: [
        { provide: PerformanceService, useValue: mockPerformanceService },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    })
      .overrideComponent(LavaLampWallComponent, {
        set: {
          template: '<div #canvasContainer></div>',
          imports: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(LavaLampWallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    activeSceneSubject.next('NONE');
    activeScenePausedSubject.next(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set frameloop to always when LAVA_WALL is active', () => {
    activeSceneSubject.next('LAVA_WALL');
    expect(component.frameloop()).toBe('always');

    activeSceneSubject.next('NONE');
    expect(component.frameloop()).toBe('demand');
  });

  it('should set frameloop to demand when paused', () => {
    activeSceneSubject.next('LAVA_WALL');
    expect(component.frameloop()).toBe('always');

    activeScenePausedSubject.next(true);
    expect(component.frameloop()).toBe('demand');

    activeScenePausedSubject.next(false);
    expect(component.frameloop()).toBe('always');
  });
});
