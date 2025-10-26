import { Color } from 'three';
import {
  gemRandomPosition,
  gemRandomRotation,
  gemRandomScale,
  gemRandomRoughness,
  gemRandomSpin,
  gemRandomFall,
  gemRandomColor,
  classifyGem,
  calculateGemValue
} from './gemstone-utils';

describe('gemstone-utils', () => {
  it('gemRandomPosition stays within spread bounds', () => {
    const [x, y, z] = gemRandomPosition();
    expect(x).toBeGreaterThanOrEqual(-10);
    expect(x).toBeLessThanOrEqual(10);
    expect(y).toBeGreaterThanOrEqual(-20);
    expect(y).toBeLessThanOrEqual(5);
    expect(z).toBeGreaterThanOrEqual(-10);
    expect(z).toBeLessThanOrEqual(10);
  });

  it('gemRandomRotation returns three angles between 0 and 2π', () => {
    const rotation = gemRandomRotation();
    expect(rotation.length).toBe(3);
    rotation.forEach(angle => {
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(Math.PI * 2);
    });
  });

  it('gemRandomScale falls between 5 and 50', () => {
    const scale = gemRandomScale();
    expect(scale).toBeGreaterThanOrEqual(5);
    expect(scale).toBeLessThanOrEqual(50);
  });

  it('gemRandomRoughness falls between 0.4 and 0.5', () => {
    const roughness = gemRandomRoughness();
    expect(roughness).toBeGreaterThanOrEqual(0.4);
    expect(roughness).toBeLessThanOrEqual(0.5);
  });

  it('gemRandomSpin falls between 0.001 and 0.01', () => {
    const spin = gemRandomSpin();
    expect(spin).toBeGreaterThanOrEqual(0.001);
    expect(spin).toBeLessThanOrEqual(0.01);
  });

  it('gemRandomFall falls between 0.0001 and 0.0004', () => {
    const fall = gemRandomFall();
    expect(fall).toBeGreaterThanOrEqual(0.0001);
    expect(fall).toBeLessThanOrEqual(0.0004);
  });

  it('gemRandomColor returns a Color instance', () => {
    expect(gemRandomColor()).toEqual(jasmine.any(Color));
  });

  it('calculateGemValue applies base, scale, and roughness multipliers', () => {
    const value = calculateGemValue(10, new Color(1, 1, 1), 0.2); // diamond
    expect(value).toBe(5000 * 10 * (1 - 0.2));
  });
});
