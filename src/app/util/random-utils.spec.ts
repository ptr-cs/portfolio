import { rand, randSigned, randSpin, pick } from './random-utils';

describe('random-utils', () => {
  it('rand returns value in given range', () => {
    spyOn(Math, 'random').and.returnValue(0.5);
    expect(rand(0, 10)).toBe(5);
  });

  it('randSigned returns signed value with equal chance', () => {
    const randomSpy = spyOn(Math, 'random');
    randomSpy.and.returnValues(0.25, 0.4, 0.3);
    expect(randSigned(0, 10)).toBe(-2.5);
    expect(randSigned(0, 10)).toBe(3);
  });

  it('pick returns element from array based on random index', () => {
    spyOn(Math, 'random').and.returnValue(0.99);
    expect(pick(['a', 'b', 'c'])).toBe('c');
  });
});
