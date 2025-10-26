import { PerformanceService, ACTIVE_SCENE_KEY } from './performance.service';

describe('PerformanceService', () => {
  let service: PerformanceService;

  beforeEach(() => {
    service = new PerformanceService();
  });

  it('should initialize with default values', () => {
    expect(service.activeScene).toBe('NONE');
    expect(service.activeScenePaused).toBeFalse();
    expect(service.pausedFromGemsDash).toBeFalse();
    expect(service.activeScrollElement).toBe('');
  });

  it('should emit when active scene changes', () => {
    const scenes: ACTIVE_SCENE_KEY[] = [];
    service.activeScene$.subscribe(value => scenes.push(value));

    service.setActiveScene('LAVA_WALL');
    service.setActiveScene('GEMS');

    expect(scenes).toEqual(['NONE', 'LAVA_WALL', 'GEMS']);
    expect(service.activeScene).toBe('GEMS');
  });

  it('should reset pausedFromGemsDash when leaving GEMS', () => {
    service.setActiveScene('GEMS');
    service.setPausedFromGemsDash(true);
    expect(service.pausedFromGemsDash).toBeTrue();

    service.setActiveScene('LAVA_SINGLE');
    expect(service.pausedFromGemsDash).toBeFalse();
  });

  it('should update activeScenePaused state', () => {
    const pausedValues: boolean[] = [];
    service.activeScenePaused$.subscribe(value => pausedValues.push(value));

    service.setActiveScenePaused(true);
    service.setActiveScenePaused(false);

    expect(pausedValues).toEqual([false, true, false]);
    expect(service.activeScenePaused).toBeFalse();
  });

  it('should update active scroll element only when changed', () => {
    const elements: string[] = [];
    service.activeScrollElement$.subscribe(value => elements.push(value));

    service.setActiveScrollElement('home');
    service.setActiveScrollElement('home'); // no change
    service.setActiveScrollElement('contact');

    expect(elements).toEqual(['', 'home', 'contact']);
    expect(service.activeScrollElement).toBe('contact');
  });

  it('should update pausedFromGemsDash state', () => {
    const pausedValues: boolean[] = [];
    service.pausedFromGemsDash$.subscribe(value => pausedValues.push(value));

    service.setPausedFromGemsDash(true);
    service.setPausedFromGemsDash(false);

    expect(pausedValues).toEqual([false, true, false]);
  });
});
