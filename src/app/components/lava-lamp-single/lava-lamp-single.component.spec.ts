import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { LavaLampSingleComponent } from './lava-lamp-single.component';
import { PerformanceService } from '../../services/performance.service';
import { SettingsService } from '../../services/settings.service';

describe('LavaLampSingleComponent', () => {
  let fixture: ComponentFixture<LavaLampSingleComponent>;
  let component: LavaLampSingleComponent;

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
      imports: [LavaLampSingleComponent],
      providers: [
        { provide: PerformanceService, useValue: mockPerformanceService },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    })
      .overrideComponent(LavaLampSingleComponent, {
        set: {
          template: '<div #canvasContainer></div>',
          imports: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(LavaLampSingleComponent);
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

  it('should set frameloop to always when LAVA_SINGLE is active', () => {
    activeSceneSubject.next('LAVA_SINGLE');
    expect(component.frameloop()).toBe('always');

    activeSceneSubject.next('NONE');
    expect(component.frameloop()).toBe('demand');
  });

  it('should set frameloop to demand when paused', () => {
    activeSceneSubject.next('LAVA_SINGLE');
    expect(component.frameloop()).toBe('always');

    activeScenePausedSubject.next(true);
    expect(component.frameloop()).toBe('demand');

    activeScenePausedSubject.next(false);
    expect(component.frameloop()).toBe('always');
  });
});
