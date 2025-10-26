import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { GemstonesComponent } from './gemstones.component';
import { PerformanceService } from '../../services/performance.service';
import { SettingsService } from '../../services/settings.service';

describe('GemstonesComponent', () => {
  let fixture: ComponentFixture<GemstonesComponent>;
  let component: GemstonesComponent;

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
      imports: [GemstonesComponent],
      providers: [
        { provide: PerformanceService, useValue: mockPerformanceService },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    })
      .overrideComponent(GemstonesComponent, {
        set: {
          template: '<div #canvasContainer></div>',
          imports: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(GemstonesComponent);
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

  it('should toggle frameloop based on active scene', () => {
    activeSceneSubject.next('GEMS');
    expect(component.frameloop()).toBe('always');

    activeSceneSubject.next('NONE');
    expect(component.frameloop()).toBe('demand');
  });

  it('should pause frameloop when gems scene is paused', () => {
    activeSceneSubject.next('GEMS');
    expect(component.frameloop()).toBe('always');

    activeScenePausedSubject.next(true);
    expect(component.frameloop()).toBe('demand');

    activeScenePausedSubject.next(false);
    expect(component.frameloop()).toBe('always');
  });
});
