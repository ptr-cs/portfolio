import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumeComponent } from './resume.component';
import { ThemeService } from '../../../services/theme.service';
import { LanguageService, TranslationEntry, TranslationData } from '../../../services/language.service';

describe('ResumeComponent', () => {
  let component: ResumeComponent;
  let fixture: ComponentFixture<ResumeComponent>;

  const resumeTranslations: NonNullable<TranslationData['resume']> = {
    resume: { en: 'Resume' },
    experienceHeader: { en: 'Experience' },
    publicationsHeader: { en: 'Publications' },
    educationHeader: { en: 'Education' },
    highlightsHeader: { en: 'Highlights' },
    skillsHeader: { en: 'Skills' },
    experience: [
      {
        duration: { en: '2020-2021' },
        role: { en: 'Developer' },
        organization: { en: 'Company' },
        description: { en: 'Built things' },
        location: { en: 'Remote' }
      }
    ],
    publications: [
      {
        publicationDate: { en: '2022' },
        description: { en: 'Article' },
        location: { en: 'Web' },
        link: { en: 'https://example.com' },
        organization: { en: 'Org' }
      }
    ],
    education: [
      {
        institution: { en: 'School' },
        location: { en: 'City' },
        duration: { en: '2015-2019' },
        degree: { en: 'BSc' },
        highlights: [{ en: 'Honor' }]
      }
    ],
    skills: [{ en: 'Angular' }]
  };

  const mockThemeService = jasmine.createSpyObj<ThemeService>('ThemeService', [], {
    theme: 'light'
  });

  const mockLanguageService = jasmine.createSpyObj<LanguageService>('LanguageService', ['getText'], {
    language: 'en',
    translationData: {
      resume: resumeTranslations
    }
  });

  mockLanguageService.getText.and.callFake((entry?: TranslationEntry) => entry!['en'] ?? '');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose injected services', () => {
    expect(component.themeService).toBe(mockThemeService);
    expect(component.languageService).toBe(mockLanguageService);
  });
});
