import { Injectable } from '@angular/core';
import { Color } from 'three';
import { BehaviorSubject } from 'rxjs';

export type LavaColor = 'red' | 'yellow' | 'green' | 'blue' | 'custom' | 'none';

export const PRESET_HEX: Record<LavaColor, `#${string}`> = {
  red: '#ff0019',
  yellow: '#ffc300',
  green: '#00aa00',
  blue: '#0090ff',
  custom: '#c800ff',
  none: '#000000'
};

@Injectable({ providedIn: 'root' })
export class LampService {
  private readonly KEY_TYPE = 'lamp:lavaType';
  private readonly KEY_CUSTOM = 'lamp:lavaCustomHex';

  private _type$ = new BehaviorSubject<LavaColor>('none');
  private _color$ = new BehaviorSubject<Color>(new Color(PRESET_HEX.blue));
  private _customColor$ = new BehaviorSubject<Color>(new Color(PRESET_HEX.custom));
  private _needRandomColorsUpdate$ = new BehaviorSubject<boolean>(false);

  readonly type$ = this._type$.asObservable();
  readonly color$ = this._color$.asObservable();
  readonly customColor$ = this._customColor$.asObservable();
  readonly needRandomColorsUpdate$ = this._needRandomColorsUpdate$.asObservable();

  get type(): LavaColor { return this._type$.value; }
  set type(type: LavaColor) { this.setType(type); }
  get color(): Color { return this._color$.value; }
  get customColor(): Color { return this._customColor$.value; }
  get needRandomColorsUpdate(): boolean { return this._needRandomColorsUpdate$.value; }
  toHex(): string { return '#' + this.color.getHexString(); }

  loadSaved(defaultType: LavaColor = 'blue', defaultCustom = PRESET_HEX['custom']) {
    const savedType = (localStorage.getItem(this.KEY_TYPE) as LavaColor) || defaultType;
    const savedCustom = localStorage.getItem(this.KEY_CUSTOM) || defaultCustom;
    if (savedType === 'custom') 
      this.setCustomColor(savedCustom);
    else 
      this.setType(savedType);
  }

  setType(next: LavaColor) {
    const hex = (next === 'none') ? `#${this.customColor.getHexString()}` : PRESET_HEX[next];
    this._type$.next(next);
    (next === 'custom') ? this._color$.next(new Color(this.customColor)) : this._color$.next(new Color(hex));
    localStorage.setItem(this.KEY_TYPE, next);
  }

  setCustomColor(hex: string) {
    if (!hex.startsWith('#'))
      hex = "#" + hex;
    this._type$.next('custom');
    this._color$.next(new Color(hex));
    this._customColor$.next(new Color(hex));
    localStorage.setItem(this.KEY_TYPE, 'custom');
    localStorage.setItem(this.KEY_CUSTOM, hex);
  }

  setNeedRandomColorsUpdate(next: boolean) {
    if (next !== this._needRandomColorsUpdate$.value) {
      this._needRandomColorsUpdate$.next(next);
    }
  }
}