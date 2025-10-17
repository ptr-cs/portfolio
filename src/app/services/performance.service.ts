import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ACTIVE_SCENE_KEY = 'LAVA_SINGLE' | 'LAVA_WALL' | 'GEMS';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private _activeScene$ = new BehaviorSubject<ACTIVE_SCENE_KEY>("LAVA_SINGLE");
  readonly activeScene$ = this._activeScene$.asObservable();
  
  private _activeScenePaused$ = new BehaviorSubject<boolean>(false);
  readonly activeScenePaused$ = this._activeScenePaused$.asObservable();

  get activeScene(): ACTIVE_SCENE_KEY {
    return this._activeScene$.value;
  }

  setActiveScene(q: ACTIVE_SCENE_KEY): void {
    if (q !== this._activeScene$.value) {
      this._activeScene$.next(q);
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
}
