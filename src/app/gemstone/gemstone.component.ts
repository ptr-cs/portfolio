import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, input, model, NgZone, OnDestroy, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { applyProps, injectBeforeRender, NgtArgs, NgtPrimitive, NgtVector3 } from 'angular-three';
import { injectGLTF } from 'angular-three-soba/loaders';
import { Subscription } from 'rxjs';
import { Color, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { SkeletonUtils, ThreeMFLoader } from 'three-stdlib';
import { LampService } from '../services/lamp.service';
import { rand } from "../util/random-utils"
import { calculateGemValue, classifyGem, gemRandomColor, gemRandomFall, gemRandomRoughness, gemRandomScale, gemRandomSpin } from '../util/gemstone-utils';
import { GemsService } from '../services/gems.service';
import { environment } from '../../environments/environment';
import { centerAtWorldOrigin } from '../util/three-utils';
import { Obj } from '@popperjs/core';

@Component({
  selector: 'gemstone',
  template: `
        <ngt-primitive *args="[model()]" [position]="position()" [rotation]="rotation()" [scale]="scale()" [color]="color()" [roughness]="roughness()" [spin]="spin()" [fall]="fall()" [topY]="topY()" [valuation]="valuation()"/>
    `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtArgs],
  standalone: true,
})
export class Gemstone {
  position = model<NgtVector3>([0,0,0]);
  rotation = model<NgtVector3>([0,0,0]);
  spin = model<number>(0);
  fall = model<number>(0);
  color = model<Color>(new Color(0x00ff00));
  roughness = model<number>(0);
  scale = model<number>(1);
  topY = model<number>(0);
  
  gltf = injectGLTF(() => environment.diamondUrl);
  diamondObj?: Object3D;
  spinVal: number = 0;
  fallVal: number = 0;
  valuation = model(0);

  gemsResetMinY = -.7
  fallCounter = 0;
  initialPosition?: any;
  resetThreshold = -1.5;

  axis = new Vector3(1, 1, 0).normalize();

  protected model = computed(() => {
    const gltf = this.gltf();
    if (!gltf) return null;
    
    // if the 3D model is a placeholder, we are loading the objects within 
    // the placeholder scene instead of the typical scene:
    const isPlaceholder = environment.diamondUrl.includes('placeholder');
    const materialKey = isPlaceholder ? "Material" : "Diamond";
    const objectKey = isPlaceholder ? "Cube" : "Diamond_Diamond_0";

    const root = SkeletonUtils.clone(gltf.scene) as Object3D;
    const { materials } = gltf;

    applyProps(materials[materialKey], { color: this.color(), roughness: this.roughness(), metalness: 1, transparent: false, opacity: 1 });

    const diamondObj = root.children.find(c => c.name === objectKey);
    this.diamondObj = diamondObj!;
    this.diamondObj.position.setY(this.diamondObj.position.y - this.fall()! * rand(0, 4000))
    this.diamondObj.rotateOnAxis(this.axis, this.spin()! * rand(0, 1000))

    // bind the clone references to allow independent manipulation of clone materials
    this.bindCloneRefs(root);

    return root;
  });

  private bindCloneRefs(root: Object3D) {
    if (!this.diamondObj) return;
    this.diamondObj!.traverse((o: any) => {
      if (!o?.isMesh || !o.material) return;
      o.material = Array.isArray(o.material)
        ? o.material.map((m: any) => (m as MeshStandardMaterial).clone())
        : (o.material as MeshStandardMaterial).clone();
    });
  }

  constructor(private lampService: LampService, private gemsService: GemsService, private zone: NgZone) {
    
    effect(() => {
      this.initialPosition = this.position();
      this.fallVal = this.fall()!;
      this.spinVal = this.spin()!; 
    });

    const now = new Date();

    injectBeforeRender(({ delta }) => {
      if (this.diamondObj) {
        this.diamondObj.position.y -= this.fallVal;

        this.diamondObj.rotateOnAxis(this.axis, this.spinVal);
        if (this.diamondObj.position.y <= this.resetThreshold) {
          this.diamondObj.position.set(0, 0, 0);
          this.randomize();
          this.gemsService.setTotalValueDirty(true);
          if (this.gemsService.recentlyAdded.length >= 3)
            this.gemsService.shiftRecentlyAdded();
          this.gemsService.addToRecentlyAdded({"type": classifyGem(this.color()!), "scale": this.scale(), "roughness": this.roughness(), "value": this.valuation().toFixed(2), "timestamp": new Date()});
        }
      }
    });
  }
  
  randomize(colorOverride: Color | undefined = undefined) {
    let s = gemRandomScale();
    let c = this.lampService.type !== 'none' ? this.lampService.color : gemRandomColor();
    let r = gemRandomRoughness();
    this.rotation.set([0,0,0]);
    this.fall.set(gemRandomFall());
    this.spin.set(gemRandomSpin());
    this.scale.set(s);
    this.color.set(c);
    this.roughness.set(r);
    const newVal = calculateGemValue(s,c,r);
    this.valuation.set(newVal);
  }
  
  // operate directly on the mesh material instead of the color property, which incurs update delays
  setColorFast(c: Color) {
  this.zone.runOutsideAngular(() => {
    const mesh = (this.diamondObj as any);
    if (!mesh) return;
    const mat = mesh?.material as any;
    if (!mat) return;
    mat?.color?.set(c);
  });
}
  
  // operate directly on the mesh material instead of the color property, which incurs update delays
  getColorFast(): Color | undefined {
    const mesh = (this.diamondObj as any);
    if (!mesh) return;
    const mat = mesh?.material as any;
    if (!mat) return;
    return mat.color;
  }
}
