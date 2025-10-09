import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GemsService {
  private _totalValue$ = new BehaviorSubject<number>(0);
  readonly totalValue$ = this._totalValue$.asObservable();
  
  private _averageValue$ = new BehaviorSubject<number>(0);
  readonly averageValue$ = this._averageValue$.asObservable();
  
  private _averageScale$ = new BehaviorSubject<number>(0);
  readonly averageScale$ = this._averageScale$.asObservable();
  
  private _averageRoughness$ = new BehaviorSubject<number>(0);
  readonly averageRoughness$ = this._averageRoughness$.asObservable();
  
  private _distribution$ = new BehaviorSubject<any[]>([]);
  readonly distribution$ = this._distribution$.asObservable();
  
  private _totalValueHistory$ = new BehaviorSubject<any[]>([]);
  readonly totalValueHistory$ = this._totalValueHistory$.asObservable();
  
  private _recentlyAdded$ = new BehaviorSubject<any[]>([]);
  readonly recentlyAdded$ = this._recentlyAdded$.asObservable();
  
  private _totalValueDirty$ = new BehaviorSubject<boolean>(false);
  readonly totalValueDirty$ = this._totalValueDirty$.asObservable();
  
  get totalValue(): number {
    return this._totalValue$.value;
  }

  setTotalValue(v: number): void {
    if (v !== this._totalValue$.value) {
      this._totalValue$.next(v);
    }
  }
  
  get averageValue(): number {
    return this._averageValue$.value;
  }

  setAverageValue(v: number): void {
    if (v !== this._averageValue$.value) {
      this._averageValue$.next(v);
    }
  }
  
  get averageScale(): number {
    return this._averageScale$.value;
  }

  setAverageScale(s: number): void {
    if (s !== this._averageScale$.value) {
      this._averageScale$.next(s);
    }
  }
  
  get averageRoughness(): number {
    return this._averageRoughness$.value;
  }

  setAverageRoughness(r: number): void {
    if (r !== this._averageRoughness$.value) {
      this._averageRoughness$.next(r);
    }
  }
  
  get totalValueDirty(): boolean {
    return this._totalValueDirty$.value;
  }

  setTotalValueDirty(b: boolean): void {
    if (b !== this._totalValueDirty$.value) {
      this._totalValueDirty$.next(b);
    }
  }
  
  get distribution(): any[] {
    return this._distribution$.value;
  }

  setDistribution(d: any[]): void {
    if (d !== this._distribution$.value) {
      this._distribution$.next(d);
    }
  }
  
  get totalValueHistory(): any[] {
    return this._totalValueHistory$.value;
  }

  setTotalValueHistory(v: any[]): void {
      this._totalValueHistory$.next(v);
  }
  
  get recentlyAdded(): any[] {
    return this._recentlyAdded$.value;
  }
  
  addToRecentlyAdded(item: any): void {
    this._recentlyAdded$.value.push(item);
  }
  
  shiftRecentlyAdded(): void {
    this._recentlyAdded$.value.shift();
  }
}
