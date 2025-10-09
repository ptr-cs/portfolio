import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _displayStats$ = new BehaviorSubject<boolean>(true);
  readonly displayStats$ = this._displayStats$.asObservable();
  
  private _fullscreenActive$ = new BehaviorSubject<boolean>(false);
  readonly fullscreenActive$ = this._fullscreenActive$.asObservable();
  
  get displayStats(): boolean {
    return this._displayStats$.value;
  }

  setDisplayStats(q: boolean): void {
    if (q !== this._displayStats$.value) {
      this._displayStats$.next(q);
    }
  }
  
  get fullscreenActive(): boolean {
    return this._fullscreenActive$.value;
  }

  setFullscreenActive(q: boolean): void {
    if (q !== this._fullscreenActive$.value) {
      this._fullscreenActive$.next(q);
    }
  }
}
