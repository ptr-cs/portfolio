import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, viewChild } from "@angular/core";
import { NgtArgs } from "angular-three";
import { injectPlane } from "angular-three-cannon/body";
import { Mesh } from "three";

@Component({
  selector: 'app-floor',
  template: `
    <ngt-mesh #floor [receiveShadow]="true" >
      <ngt-plane-geometry *args="[1000, 1000]"/>
      <ngt-shadow-material color="#171717" [transparent]="true" [opacity]="0.4" />
    </ngt-mesh>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtArgs],
})
export class Floor {
  meshRef = viewChild.required<ElementRef<Mesh>>('floor');
  
  @Input() position: [number, number, number] = [0, 0, 0];
  @Input() rotation: [number, number, number] = [0, 0, 0];
  @Input() floorType: 'floor' | 'ceiling' = "floor";
  
  
  constructor() {
    injectPlane(() => ({ rotation: this.rotation, position: this.position, userData: { type: this.floorType } }), this.meshRef);
  }
}