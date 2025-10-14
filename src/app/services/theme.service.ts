import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Color } from 'three';

export type Theme = 'light' | 'dark';

export function getDefaultTheme() : Theme { return 'dark' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'app-theme';
  private media = window.matchMedia?.('(prefers-color-scheme: dark)');
  private _theme$ = new BehaviorSubject<Theme>(this.initialTheme());

  theme$ = this._theme$.asObservable();
  
  colorLight = new Color("#bbbbbb");
  colorDark = new Color("#111111");
  
  constructor() {
    this.apply(this._theme$.value);
  }
  
  get theme(): Theme {
      return this._theme$.value;
  }
  
  set theme(theme: Theme) {
    this.apply(theme);
  }

  private initialTheme(): Theme {
    const saved = (localStorage.getItem(this.key) as Theme | null);
    if (saved) return saved;
    return 'dark';
  }

  apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(this.key, theme);
    this._theme$.next(theme);
  }

  toggle() {
    const next: Theme = (this._theme$.value === 'dark') ? 'light' : 'dark';
    this.apply(next);
  }
}
