import { Color } from "three";
import { rand } from "./random-utils"
import { getRandomColor } from "./three-utils";

const GEM_SPREAD_X: number = 6;
const GEM_SPREAD_Z: number = 1;
const GEM_MIN_FALL: number = .0001;
const GEM_MAX_FALL: number = .0004;
const GEM_MIN_SPIN: number = .001;
const GEM_MAX_SPIN: number = .01;
const GEM_MIN_SCALE: number = 3;
const GEM_MAX_SCALE: number = 30;
const GEM_MIN_ROUGHNESS: number = .4;
const GEM_MAX_ROUGHNESS: number = .5;

export function gemRandomPosition(): number[] {
    return [rand(-GEM_SPREAD_X, GEM_SPREAD_X), 8, rand(-GEM_SPREAD_Z, GEM_SPREAD_Z)] 
}

export function gemRandomScale(): number {
    return rand(GEM_MIN_SCALE, GEM_MAX_SCALE);
}

export function gemRandomRoughness(): number {
    return rand(GEM_MIN_ROUGHNESS, GEM_MAX_ROUGHNESS);
}

export function gemRandomColor(): Color {
    return getRandomColor();
}

export function gemRandomSpin(): number {
    return rand(GEM_MIN_SPIN, GEM_MAX_SPIN);
}

export function gemRandomFall(): number {
    return rand(GEM_MIN_FALL, GEM_MAX_FALL);
}

export function classifyGem(color: Color): string {
  const gemColors: Record<string, [number, number, number]> = {
    diamond:  [1.0, 1.0, 1.0],
    ruby:     [1.0, 0.0, 0.0],
    emerald:  [0.0, 1.0, 0.0],
    sapphire: [0.0, 0.0, 1.0],
    topaz:    [1.0, 1.0, 0.0],
    amethyst: [0.6, 0.0, 0.6],
  };

  const { r, g, b } = color;

  let closest = 'unknown';
  let minDistance = Number.POSITIVE_INFINITY;

  for (const [gem, [gr, gg, gb]] of Object.entries(gemColors)) {
    const dist = Math.sqrt(
      Math.pow(r - gr, 2) +
      Math.pow(g - gg, 2) +
      Math.pow(b - gb, 2)
    );

    if (dist < minDistance) {
      minDistance = dist;
      closest = gem;
    }
  }

  return closest;
}

export function calculateGemValue(scale: number, color: Color, roughness: number): number {
  const baseValues: { [key: string]: number } = {
    diamond: 5000,
    sapphire: 3000,
    ruby: 3500,
    emerald: 3200,
    topaz: 1500,
    amethyst: 1800,
    unknown: 1000
  };
  const gemType = classifyGem(color);
  const baseValue = baseValues[gemType];
  const scaleMultiplier = scale;
  const roughnessMultiplier = 1 - roughness;
  const finalValue = baseValue * scaleMultiplier * roughnessMultiplier;
  return Math.max(0, finalValue);
}