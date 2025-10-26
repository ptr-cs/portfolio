import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, Input, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mini-color-picker',
  templateUrl: './mini-color-picker.html',
  styleUrl: './mini-color-picker.scss',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MiniColorPickerComponent implements AfterViewInit {
  @ViewChild('strip', { static: false }) stripRef?: ElementRef<HTMLElement>;

  @Input() hex: string = '#00cfc2';
  @Input() hexString: (string | undefined) = 'Hex';
  
  hue = signal(180);
  
  hexDraft = this.hex;

  @Output() colorChange = new EventEmitter<string>();

  private dragging = false;
  
  @HostListener('window:pointermove', ['$event'])
  onWinPointerMove(ev: PointerEvent) {
    if (!this.dragging) return;
    this.pickFromPointer(ev);
  }
  
  private pickFromPointer(ev: PointerEvent) {
    const c = this.stripRef?.nativeElement; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
    const hue = Math.round((x / rect.width) * 359);
    const hex = this.hslToHex(hue, 100, 50);
    this.hex = hex;
    this.hue.set(hue);
    this.emitColor(hex);
    ev.preventDefault();
  }
  
  onSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const hue = parseInt(target.value, 10);
    this.hue.set(hue);
    const hex = this.hslToHex(hue, 100, 50);
    this.hex = hex;
    this.emitColor(hex);
  }
  
  public applyHue(hue: number) {
    this.hue.set(hue);
  }
  
  public hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return Math.round(h);
}
  
  onStripPointerDown(ev: PointerEvent) {
    const el = this.stripRef?.nativeElement; if (!el) return;
    el.setPointerCapture?.(ev.pointerId);
    this.dragging = true;
    this.pickFromPointer(ev);
  }

  @HostListener('window:pointerup', ['$event'])
  @HostListener('window:pointercancel', ['$event'])
  onWinPointerUp(ev: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    const el = this.stripRef?.nativeElement;
    el?.releasePointerCapture?.(ev.pointerId);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.emitColor(this.hex);
      this.hue.set(this.hexToHue(this.hex));
    });
  }

  onCanvasClick(ev: MouseEvent) {
    const c = this.stripRef?.nativeElement;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
    const hue = Math.round((x / rect.width) * 359);
    this.hue.set(hue);
    const hex = this.hslToHex(hue, 100, 50);
    this.hex = hex;
    this.emitColor(hex);
  }

  applyHex(val: string, source: 'input' | 'init' = 'input') {
    const clean = this.normalizeHex(val);
    if (!clean) return;
    this.hex = clean;
    this.emitColor(clean);
  }

  private emitColor(hex: string) {
    this.colorChange.emit(hex);
  }

  private normalizeHex(x: string): string | null {
    if (!x) return null;
    let h = x.toLowerCase()
    if (!h.startsWith('#')) h = '#' + h;
    if (/^#([0-9a-f]{6})$/.test(h)) return h;
    if (/^#([0-9a-f]{3})$/.test(h)) {
      const r = h[1], g = h[2], b = h[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return null;
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
  }
  
  public commitHex() {
    if (!this.hex.startsWith("#")) {
      this.hex = "#" + this.hex;
    }
    this.emitColor(this.hex);
  }
}
