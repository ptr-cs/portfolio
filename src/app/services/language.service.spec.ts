import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService, TranslationEntry } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  const locationSpy = jasmine.createSpyObj<Location>('Location', ['path']);
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'createUrlTree', 'serializeUrl', 'parseUrl']);

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DatePipe, { provide: Location, useValue: locationSpy }, { provide: Router, useValue: routerSpy }]
    });

    service = TestBed.inject(LanguageService);
  });

  it('should initialize with default language when none stored', () => {
    expect(service.language).toBe('en');
  });

  it('should persist language changes to localStorage', () => {
    service.language = 'de';
    expect(localStorage.getItem('app-language')).toBe('de');
    expect(service.language).toBe('de');
  });

  it('should resolve translation text for current language', () => {
    const entry: TranslationEntry = { en: 'Hello', de: 'Hallo' };
    expect(service.getText(entry)).toBe('Hello');

    service.language = 'de';
    expect(service.getText(entry)).toBe('Hallo');
  });

  it('should handle missing translations gracefully', () => {
    expect(service.getText(undefined)).toBe('');
    expect(service.getText({ fr: 'Bonjour' })).toBe('');
  });

  it('should compute flag classes by entry and code', () => {
    const entry: TranslationEntry = { en: 'English' };
    expect(service.getFlagClass(entry)).toBe('fi-us');
    expect(service.getFlagClassByLanguageCode('de')).toBe('fi-de');
  });

  it('should translate gem entries', () => {
    service.translationData = {
      gems: {
        diamond: { en: 'Diamond' }
      }
    } as any;

    expect(service.translateGemEntry('diamond')).toBe('Diamond');
  });

  it('should format dates with current language', () => {
    const result = service.getFormattedDate(new Date('2020-01-01T00:00:00Z'));
    expect(result).toBeTruthy();
  });

  it('should return BCP47 strings', () => {
    expect(service.getBcp47String('en')).toBe('en-US');
    expect(service.getBcp47String('xx')).toBe('');
  });
});
