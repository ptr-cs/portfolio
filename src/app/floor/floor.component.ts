import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, viewChild } from "@angular/core";
import { NgtArgs } from "angular-three";
import { injectPlane } from "angular-three-cannon/body";
import { Mesh } from "three";

@Component({
  selector: 'app-floor',
  template: `
    <ngt-mesh #mesh [receiveShadow]="true">
      <ngt-plane-geometry *args="[1000, 1000]" />
      <ngt-shadow-material color="#171717" [transparent]="true" [opacity]="0.4" />
    </ngt-mesh>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtArgs],
})
export class Floor {
  meshRef = viewChild.required<ElementRef<Mesh>>('mesh');
  constructor() {
    injectPlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -20, 0], userData: { type: 'floor' } }), this.meshRef);
  }
}