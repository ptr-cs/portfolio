import { MathUtils } from "three";

export function rand(min: number, max: number) {
    return MathUtils.lerp(min, max, Math.random());
}
export function randSigned(min: number, max: number) {
    const v = rand(min, max);
    return Math.random() < 0.5 ? -v : v;
}
export function randSpin(min: number, max: number): [number, number, number] {
    return [randSigned(min, max), randSigned(min, max), randSigned(min, max)];
}
export function pick<T>(arr: T[]): T {
    return arr[(Math.random() * arr.length) | 0];
}