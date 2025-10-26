import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { ThemeService } from '../../../services/theme.service';
import { LanguageService, TranslationEntry } from '../../../services/language.service';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  const mockThemeService = jasmine.createSpyObj<ThemeService>('ThemeService', [], {
    theme: 'dark'
  });

  const mockLanguageService = jasmine.createSpyObj<LanguageService>(
    'LanguageService',
    ['getText'],
    {
      language: 'en',
      translationData: {
        contact: {
          contactInfo: { en: 'Contact' },
          contactInfoSubtext: { en: 'Reach out' }
        }
      }
    }
  );

  mockLanguageService.getText.and.callFake((entry?: TranslationEntry) => entry!['en'] ?? '');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
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
