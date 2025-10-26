import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ThemeService } from '../services/theme.service';
import { LanguageService } from '../services/language.service';
import { PerformanceService } from '../services/performance.service';
import { BehaviorSubject } from 'rxjs';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  const mockThemeService = jasmine.createSpyObj<ThemeService>('ThemeService', ['apply'], {
    theme: 'dark'
  });

  const languageSubject = new BehaviorSubject('en');
  const mockLanguageService = jasmine.createSpyObj<LanguageService>(
    'LanguageService',
    ['getFlagClassByLanguageCode'],
    {
      language$: languageSubject.asObservable(),
      language: 'en'
    }
  );
  mockLanguageService.getFlagClassByLanguageCode.and.returnValue('fi-us');

  const activeScrollSubject = new BehaviorSubject('');
  const mockPerformanceService = jasmine.createSpyObj<PerformanceService>(
    'PerformanceService',
    ['setActiveScrollElement'],
    {
      activeScrollElement$: activeScrollSubject.asObservable()
    }
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: PerformanceService, useValue: mockPerformanceService }
      ]
    })
      .overrideComponent(HeaderComponent, {
        set: {
          template: '<div></div>',
          imports: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
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

  it('should toggle theme by calling ThemeService.apply with the opposite theme', () => {
    component.toggleTheme();
    expect(mockThemeService.apply).toHaveBeenCalledWith('light');
  });
});
