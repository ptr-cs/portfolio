import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService();
  });

  it('should expose initial state', () => {
    expect(service.displayStats).toBeTrue();
    expect(service.fullscreenActive).toBeFalse();
    expect(service.displayAccessibilityControls).toBeFalse();
  });

  it('should update display stats and emit changes', (done) => {
    const values: boolean[] = [];
    service.displayStats$.subscribe(value => {
      values.push(value);
      if (values.length === 2) {
        expect(values).toEqual([true, false]);
        done();
      }
    });

    service.setDisplayStats(false);
  });

  it('should update fullscreen state', (done) => {
    const values: boolean[] = [];
    service.fullscreenActive$.subscribe(value => {
      values.push(value);
      if (values.length === 2) {
        expect(values).toEqual([false, true]);
        done();
      }
    });

    service.setFullscreenActive(true);
  });

  it('should update accessibility controls state', (done) => {
    const values: boolean[] = [];
    service.displayAccessibilityControls$.subscribe(value => {
      values.push(value);
      if (values.length === 2) {
        expect(values).toEqual([false, true]);
        done();
      }
    });

    service.setDisplayAccessibilityControls(true);
  });

  it('should emit rotation actions', (done) => {
    service.rotateScene$.subscribe(action => {
      expect(action).toBe('rotate-left');
      done();
    });

    service.notifyRotateScene('rotate-left');
  });

  it('should emit zoom actions', (done) => {
    service.zoomScene$.subscribe(action => {
      expect(action).toBe('zoom-in');
      done();
    });

    service.notifyZoomScene('zoom-in');
  });
});
