import * as THREE from 'three';
import { getRandomColor, centerAtWorldOrigin } from './three-utils';

describe('three-utils', () => {
  describe('getRandomColor', () => {
    it('returns a THREE.Color with components between 0 and 1', () => {
      spyOn(Math, 'random').and.returnValues(0.1, 0.5, 0.9);
      const color = getRandomColor();
      expect(color.r).toBe(0.1);
      expect(color.g).toBe(0.5);
      expect(color.b).toBe(0.9);
    });
  });
});