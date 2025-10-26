import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniColorPickerComponent } from './mini-color-picker';

describe('MiniColorPickerComponent', () => {
  let fixture: ComponentFixture<MiniColorPickerComponent>;
  let component: MiniColorPickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniColorPickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MiniColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert hex values to hue degrees', () => {
    expect(component.hexToHue('#ff0000')).toBe(0);
    expect(component.hexToHue('#00ff00')).toBe(120);
    expect(component.hexToHue('#0000ff')).toBe(240);
  });

  it('should normalize and emit hex values when applyHex is called', () => {
    let emitted: string | undefined;
    component.colorChange.subscribe(value => (emitted = value));

    component.applyHex('abc');

    expect(component.hex).toBe('#aabbcc');
    expect(emitted).toBe('#aabbcc');
  });

  it('should ensure hex values include hash when committing', () => {
    let emitted: string | undefined;
    component.colorChange.subscribe(value => (emitted = value));

    component.hex = 'aabbcc';
    component.commitHex();

    expect(component.hex).toBe('#aabbcc');
    expect(emitted).toBe('#aabbcc');
  });
});
