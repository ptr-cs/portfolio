import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type RotationAction = 'rotate-left' | 'rotate-right' | 'rotate-up' | 'rotate-down';
export type ZoomAction = 'zoom-in' | 'zoom-out';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _displayStats$ = new BehaviorSubject<boolean>(true);
  readonly displayStats$ = this._displayStats$.asObservable();
  
  private _fullscreenActive$ = new BehaviorSubject<boolean>(false);
  readonly fullscreenActive$ = this._fullscreenActive$.asObservable();
  
  private _displayAccessibilityControls$ = new BehaviorSubject<boolean>(false);
  readonly displayAccessibilityControls$ = this._displayAccessibilityControls$.asObservable();
  
  private rotateSceneSubject = new Subject<RotationAction>();
  rotateScene$ = this.rotateSceneSubject.asObservable();
  
  private zoomSceneSubject = new Subject<ZoomAction>();
  zoomScene$ = this.zoomSceneSubject.asObservable();

  notifyRotateScene(action: RotationAction): void {
    this.rotateSceneSubject.next(action);
  }
  
  notifyZoomScene(action: ZoomAction): void {
    this.zoomSceneSubject.next(action);
  }
  
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
  
  get displayAccessibilityControls(): boolean {
    return this._displayAccessibilityControls$.value;
  }

  setDisplayAccessibilityControls(q: boolean): void {
    if (q !== this._displayAccessibilityControls$.value) {
      this._displayAccessibilityControls$.next(q);
    }
  }
}
