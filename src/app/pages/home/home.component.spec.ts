import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ThemeService } from '../../services/theme.service';
import { LampService } from '../../services/lamp.service';
import { SettingsService } from '../../services/settings.service';
import { LanguageService, TranslationEntry, TranslationData } from '../../services/language.service';
import { PerformanceService } from '../../services/performance.service';
import { NgbScrollSpyService } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

class MockElementRef<T> {
  nativeElement = {} as T;
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  const mockLampService = jasmine.createSpyObj<LampService>('LampService', [], {
    type: 'none'
  });
  const mockSettingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
    'setFullscreenActive'
  ]);
  const mockThemeService = jasmine.createSpyObj<ThemeService>('ThemeService', [], {
    theme: 'dark'
  });
  const mockLanguageService = jasmine.createSpyObj<LanguageService>('LanguageService', ['getText', 'applyLanguageFromUrl'], {
    language: 'en',
    translationData: {
      home: {
        services: { en: 'Services' },
        hi: { en: 'Hi' },
        softwareEngineer: { en: 'Software Engineer' },
        buttonResume: { en: 'Resume' },
        buttonContact: { en: 'Contact' }
      },
      about: {
        aboutMe: { en: 'About Me' },
        iLoveToBuild: { en: 'I love to build' },
        specialization: { en: 'Specialization' }
      },
      resume: {
        resume: { en: 'Resume' },
        experienceHeader: { en: 'Experience' },
        publicationsHeader: { en: 'Publications' },
        educationHeader: { en: 'Education' },
        highlightsHeader: { en: 'Highlights' },
        skillsHeader: { en: 'Skills' },
        experience: [],
        publications: [],
        education: [],
        skills: []
      }
    } as TranslationData
  });
  mockLanguageService.getText.and.callFake((entry?: TranslationEntry) => entry ? (entry!['en'] ?? '') : '');

  const mockPerformanceService = jasmine.createSpyObj<PerformanceService>(
    'PerformanceService',
    ['setActiveScene', 'setActiveScenePaused', 'setActiveScrollElement'],
    {
      activeScene: 'NONE'
    }
  );

  const scrollSpyActive$ = {
    subscribe: jasmine.createSpy('subscribe')
  };
  const mockScrollSpyService = {
    active$: scrollSpyActive$,
    observe: jasmine.createSpy('observe'),
    start: jasmine.createSpy('start')
  } as unknown as NgbScrollSpyService;

  const mockRouter = jasmine.createSpyObj('Router', ['createUrlTree', 'serializeUrl']);
  const mockLocation = jasmine.createSpyObj<Location>('Location', ['replaceState']);
  const mockActivatedRoute = {} as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: LampService, useValue: mockLampService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: PerformanceService, useValue: mockPerformanceService },
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: mockLocation }
      ]
    })
      .overrideComponent(HomeComponent, {
        set: {
          template: '<div></div>',
          imports: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose injected services', () => {
    expect(component.themeService).toBe(mockThemeService);
    expect(component.languageService).toBe(mockLanguageService);
    expect(component.performanceService).toBe(mockPerformanceService);
  });
});
