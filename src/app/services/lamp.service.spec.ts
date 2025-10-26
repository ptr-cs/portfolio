import { LampService, PRESET_HEX } from './lamp.service';
import { Color } from 'three';

describe('LampService', () => {
  let service: LampService;

  beforeEach(() => {
    localStorage.clear();
    service = new LampService();
  });

  it('should initialize with default values', () => {
    expect(service.type).toBe('none');
    expect(service.color.getHexString()).toBe(new Color(PRESET_HEX.blue).getHexString());
    expect(service.customColor.getHexString()).toBe(new Color(PRESET_HEX.custom).getHexString());
  });

  it('should convert current color to hex string', () => {
    service.setType('red');
    expect(service.toHex()).toBe(PRESET_HEX.red);
  });

  it('should load saved settings from localStorage', () => {
    localStorage.setItem('lamp:lavaType', 'custom');
    localStorage.setItem('lamp:lavaCustomHex', '#123456');

    service.loadSaved('blue', PRESET_HEX.custom);
    expect(service.type).toBe('custom');
    expect(service.customColor.getHexString()).toBe(new Color('#123456').getHexString());
  });

  it('should set type and update color/ storage', () => {
    const spy = spyOn(localStorage, 'setItem').and.callThrough();
    service.setType('green');
    expect(service.type).toBe('green');
    expect(service.color.getHexString()).toBe(new Color(PRESET_HEX.green).getHexString());
    expect(spy).toHaveBeenCalledWith('lamp:lavaType', 'green');
  });

  it('should set custom color and persist values', () => {
    const spy = spyOn(localStorage, 'setItem').and.callThrough();
    service.setCustomColor('#abcdef');
    expect(service.type).toBe('custom');
    expect(service.customColor.getHexString()).toBe(new Color('#abcdef').getHexString());
    expect(service.color.getHexString()).toBe(new Color('#abcdef').getHexString());
    expect(spy).toHaveBeenCalledWith('lamp:lavaCustomHex', '#abcdef');
  });

  it('should toggle needRandomColorsUpdate flag', () => {
    const values: boolean[] = [];
    service.needRandomColorsUpdate$.subscribe(value => values.push(value));

    service.setNeedRandomColorsUpdate(true);
    service.setNeedRandomColorsUpdate(false);

    expect(values).toEqual([false, true, false]);
  });
});
