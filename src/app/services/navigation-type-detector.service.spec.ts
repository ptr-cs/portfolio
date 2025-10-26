import { NavigationTypeDetectorService } from './navigation-type-detector.service';

describe('NavigationTypeDetectorService', () => {
  let service: NavigationTypeDetectorService;
  let addEventSpy: jasmine.Spy;
  let removeEventSpy: jasmine.Spy;

  beforeEach(() => {
    addEventSpy = spyOn(window, 'addEventListener').and.callThrough();
    removeEventSpy = spyOn(window, 'removeEventListener').and.callThrough();
    service = new NavigationTypeDetectorService();
  });

  afterEach(() => {
    service.ngOnDestroy();
    addEventSpy.calls.reset();
    removeEventSpy.calls.reset();
  });

  it('should register event listeners on construction', () => {
    expect(addEventSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
  });

  it('should detect keyboard navigation when Tab is pressed', () => {
    const keydownCallback = addEventSpy.calls
      .all()
      .find(call => call.args[0] === 'keydown')?.args[1] as EventListener;

    keydownCallback?.({ key: 'Tab' } as KeyboardEvent);
    expect(service.isKeyboardNavigation).toBeTrue();
  });

  it('should detect mouse navigation on mousedown', () => {
    const mousedownCallback = addEventSpy.calls
      .all()
      .find(call => call.args[0] === 'mousedown')?.args[1] as EventListener;

    mousedownCallback?.({} as MouseEvent);
    expect(service.isKeyboardNavigation).toBeFalse();
  });

  it('should remove event listeners on destroy', () => {
    service.ngOnDestroy();

    expect(removeEventSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
  });
});
