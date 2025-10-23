import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, viewChild, ViewChild } from "@angular/core";
import { NgtArgs } from "angular-three";
import { injectBox, injectPlane } from "angular-three-cannon/body";
import { Mesh } from "three";

@Component({
  selector: 'app-wall',
  template: `
    <ngt-mesh #wall [receiveShadow]="true">
      <ngt-plane-geometry *args="[1000, 1000]" />
      <ngt-shadow-material color="#171717" [transparent]="true" [opacity]="0.4" />
    </ngt-mesh>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtArgs],
})
export class Wall {
  meshRef = viewChild.required<ElementRef<Mesh>>('wall');

  @Input() position: [number, number, number] = [0, 0, 0];
  @Input() rotation: [number, number, number] = [0, 0, 0];

  constructor() {
    injectBox(
      () => ({
        args: [25, 25, 1],
        position: this.position,
        rotation: this.rotation,
        userData: { type: 'wall' },
      }),
      this.meshRef
    );
  }
}