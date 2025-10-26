import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-bs-theme');
    TestBed.configureTestingModule({});
  });

  it('should create with default theme when no preference stored', () => {
    service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
    expect(service.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should read stored theme preference', () => {
    localStorage.setItem('app-theme', 'light');
    service = TestBed.inject(ThemeService);
    expect(service.theme).toBe('light');
  });

  it('should apply theme by updating attributes and storage', () => {
    service = TestBed.inject(ThemeService);
    spyOn(document.documentElement, 'setAttribute').and.callThrough();
    spyOn(localStorage, 'setItem').and.callThrough();

    service.apply('light');

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-bs-theme', 'light');
    expect(localStorage.setItem).toHaveBeenCalledWith('app-theme', 'light');
    expect(service.theme).toBe('light');
  });

  it('should toggle between themes', () => {
    service = TestBed.inject(ThemeService);
    service.apply('dark');
    service.toggle();
    expect(service.theme).toBe('light');

    service.toggle();
    expect(service.theme).toBe('dark');
  });
});
