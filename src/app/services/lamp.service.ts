import { Injectable } from '@angular/core';
import * as THREE from 'three';
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
  private readonly KEY_ROTATE = 'lamp:rotate';

  private _type$ = new BehaviorSubject<LavaColor>('blue');
  private _color$ = new BehaviorSubject<THREE.Color>(new THREE.Color(0x0090fe)); // intentionally set a "temp" color 
  private _customColor$ = new BehaviorSubject<THREE.Color>(new THREE.Color(PRESET_HEX.custom));
  private _rotate$ = new BehaviorSubject<boolean>(true);
  private _needRandomColorsUpdate$ = new BehaviorSubject<boolean>(false);

  readonly type$ = this._type$.asObservable();
  readonly color$ = this._color$.asObservable();
  readonly customColor$ = this._customColor$.asObservable();
  readonly rotate$ = this._rotate$.asObservable();
  readonly needRandomColorsUpdate$ = this._needRandomColorsUpdate$.asObservable();

  get type(): LavaColor { return this._type$.value; }
  set type(type: LavaColor) { this.setType(type); }
  get color(): THREE.Color { return this._color$.value; }
  get customColor(): THREE.Color { return this._customColor$.value; }
  get rotate(): boolean { return this._rotate$.value; }
  get needRandomColorsUpdate(): boolean { return this._needRandomColorsUpdate$.value; }
  toHex(): string { return '#' + this.color.getHexString(); }

  loadSaved(defaultType: LavaColor = 'blue', defaultCustom = PRESET_HEX['custom']) {
    const savedType = (localStorage.getItem(this.KEY_TYPE) as LavaColor) || defaultType;
    const savedCustom = localStorage.getItem(this.KEY_CUSTOM) || defaultCustom;
    if (savedType === 'custom') this.setCustomColor(savedCustom);
    else this.setType(savedType);

    const savedRotate = (localStorage.getItem(this.KEY_ROTATE) ?? 'false') === 'true';
    this._rotate$.next(savedRotate);
  }

  setType(next: LavaColor) {
    const hex = (next === 'none') ? `#${this.customColor.getHexString()}` : PRESET_HEX[next];
    this._type$.next(next);
    (next === 'custom') ? this._color$.next(new THREE.Color(this.customColor)) : this._color$.next(new THREE.Color(hex));
    localStorage.setItem(this.KEY_TYPE, next);
  }

  setCustomColor(hex: string) {
    if (!hex.startsWith('#'))
      hex = "#" + hex;
    this._type$.next('custom');
    this._color$.next(new THREE.Color(hex));
    this._customColor$.next(new THREE.Color(hex));
    localStorage.setItem(this.KEY_TYPE, 'custom');
    localStorage.setItem(this.KEY_CUSTOM, hex);
  }

  setLava(type: LavaColor, customHex?: string) {
    if (type === 'custom') this.setCustomColor(customHex ?? localStorage.getItem(this.KEY_CUSTOM) ?? '#00cfc2');
    else this.setType(type);
  }

  applyToWaxMaterial(mat: THREE.MeshPhysicalMaterial, emissiveIntensity = 0.15) {
    mat.color.copy(this.color);
    mat.emissive.copy(this.color);
    (mat as any).emissiveIntensity = emissiveIntensity;
    mat.needsUpdate = true;
  }

  setRotate(next: boolean) {
    if (next !== this._rotate$.value) {
      this._rotate$.next(next);
      localStorage.setItem(this.KEY_ROTATE, String(next));
    }
  }

  toggleRotate(): boolean {
    const next = !this._rotate$.value;
    this.setRotate(next);
    return next;
  }

  setNeedRandomColorsUpdate(next: boolean) {
    if (next !== this._needRandomColorsUpdate$.value) {
      this._needRandomColorsUpdate$.next(next);
    }
  }
}