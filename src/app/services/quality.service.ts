import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Quality = 'low' | 'medium' | 'high';

@Injectable({ providedIn: 'root' })
export class QualityService {
  private readonly key = 'render:quality';
  private static readonly ORDER: Quality[] = ['low', 'medium', 'high'];

  private _quality$ = new BehaviorSubject<Quality>(this.initialQuality());
  readonly quality$ = this._quality$.asObservable();

  get quality(): Quality {
    return this._quality$.value;
  }

  private isQuality(v: any): v is Quality {
    return QualityService.ORDER.includes(v as Quality);
  }

  private initialQuality(): Quality {
    const saved = localStorage.getItem(this.key);
    return this.isQuality(saved) ? saved : 'high';
  }

  setQuality(q: Quality): void {
    if (q !== this._quality$.value) {
      this._quality$.next(q);
      localStorage.setItem(this.key, q);
    }
  }

  toggle(): Quality {
    const cur = this.quality;
    const idx = QualityService.ORDER.indexOf(cur);
    const next = QualityService.ORDER[(idx + 1) % QualityService.ORDER.length];
    this.setQuality(next);
    return next;
  }
}
