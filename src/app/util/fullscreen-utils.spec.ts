import { exitFullscreen, getFullscreenElement, requestFullscreen } from './fullscreen-utils';

describe('fullscreen-utils', () => {
  const doc = document as any;
  let originalExit: any;

  beforeEach(() => {
    originalExit = doc.exitFullscreen;
  });

  afterEach(() => {
    if (originalExit) {
      doc.exitFullscreen = originalExit;
    } else {
      delete doc.exitFullscreen;
    }
    delete doc.webkitExitFullscreen;
    delete doc.mozCancelFullScreen;
    delete doc.msExitFullscreen;
  });

  it('should return current fullscreen element using standard property', () => {
    const element = document.createElement('div');
    const spy = spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(element);

    expect(getFullscreenElement()).toBe(element);
    spy.and.callThrough();
  });

  it('should return current fullscreen element using vendor-specific properties', () => {
    const element = document.createElement('div');
    if (!Object.getOwnPropertyDescriptor(doc, 'webkitFullscreenElement')) {
      Object.defineProperty(doc, 'webkitFullscreenElement', {
        configurable: true,
        get: () => undefined
      });
    }
    const spy = spyOnProperty(doc, 'webkitFullscreenElement', 'get').and.returnValue(element);

    expect(getFullscreenElement()).toBe(element);
    spy.and.callThrough();
  });

  it('should request fullscreen on provided element', async () => {
    const element = document.createElement('div');
    const requestSpy = spyOn(element, 'requestFullscreen').and.returnValue(Promise.resolve());

    await requestFullscreen(element);

    expect(requestSpy).toHaveBeenCalled();
  });

  it('should exit fullscreen using standard API', () => {
    const exitSpy = spyOn(document, 'exitFullscreen' as any).and.callFake(() => undefined);

    exitFullscreen();

    expect(exitSpy).toHaveBeenCalled();
  });

  it('should exit fullscreen using vendor-specific API fallback', () => {
    const exitSpy = jasmine.createSpy('webkitExitFullscreen');
    doc.exitFullscreen = undefined;
    doc.webkitExitFullscreen = exitSpy;

    exitFullscreen();

    expect(exitSpy).toHaveBeenCalled();
    delete doc.webkitExitFullscreen;
    doc.exitFullscreen = originalExit;
  });
});
