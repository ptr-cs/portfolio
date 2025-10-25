import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ACTIVE_SCENE_KEY = 'LAVA_SINGLE' | 'LAVA_WALL' | 'GEMS' | 'NONE';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private _activeScene$ = new BehaviorSubject<ACTIVE_SCENE_KEY>("NONE");
  readonly activeScene$ = this._activeScene$.asObservable();
  
  private _activeScrollElement$ = new BehaviorSubject<string>("");
  readonly activeScrollElement$ = this._activeScrollElement$.asObservable();
  
  private _activeScenePaused$ = new BehaviorSubject<boolean>(false);
  readonly activeScenePaused$ = this._activeScenePaused$.asObservable();
  
  private _pausedFromGemsDash$ = new BehaviorSubject<boolean>(false);
  readonly pausedFromGemsDash$ = this._pausedFromGemsDash$.asObservable();

  get activeScene(): ACTIVE_SCENE_KEY {
    return this._activeScene$.value;
  }

  setActiveScene(q: ACTIVE_SCENE_KEY): void {
    if (q !== this._activeScene$.value) {
      this._activeScene$.next(q);
      if (q !== 'GEMS')
        this.setPausedFromGemsDash(false);
    }
  }
  
  get activeScenePaused(): boolean {
    return this._activeScenePaused$.value;
  }

  setActiveScenePaused(q: boolean): void {
    if (q !== this._activeScenePaused$.value) {
      this._activeScenePaused$.next(q);
    }
  }
  
  get pausedFromGemsDash(): boolean {
    return this._pausedFromGemsDash$.value;
  }

  setPausedFromGemsDash(q: boolean): void {
    if (q !== this._pausedFromGemsDash$.value) {
      this._pausedFromGemsDash$.next(q);
    }
  }
  
  get activeScrollElement(): string {
    return this._activeScrollElement$.value;
  }

  setActiveScrollElement(scrollElement: string): void {
    if (scrollElement !== this._activeScrollElement$.value) {
      this._activeScrollElement$.next(scrollElement);
    }
  }
}
