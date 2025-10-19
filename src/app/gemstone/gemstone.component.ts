import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, input, OnDestroy, signal, WritableSignal } from '@angular/core';
import { applyProps, injectBeforeRender, NgtArgs } from 'angular-three';
import { injectGLTF } from 'angular-three-soba/loaders';
import { Subscription } from 'rxjs';
import { Color, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { SkeletonUtils, ThreeMFLoader } from 'three-stdlib';
import { LampService } from '../services/lamp.service';
import { rand } from "../util/random-utils"
import { colorPresetActivated } from '../util/color-utils';
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
  position = input([0, 0, 0]);
  positionSignal: WritableSignal<number[]> = signal<number[]>(this.position());
  rotation = input([0, 0, 0]);
  rotationSignal: WritableSignal<number[]> = signal<number[]>(this.rotation());
  spin = input(0);
  spinSignal: WritableSignal<number> = signal<number>(this.spin());
  fall = input(0);
  fallSignal: WritableSignal<number> = signal<number>(this.fall());
  color = input(new Color(0xFF69B4));
  colorSignal: WritableSignal<Color> = signal<Color>(this.color());
  colorReadable: Color = this.colorSignal();
  roughness = input(0.4);
  roughnessSignal: WritableSignal<number> = signal<number>(this.roughness());
  roughnessReadable: number = this.roughnessSignal();
  scale = input(1);
  scaleSignal: WritableSignal<number> = signal<number>(this.scale());
  scaleReadable: number = this.scaleSignal();
  topY = input(0);
  
  gltf = injectGLTF(() => environment.diamondUrl);
  diamondObj?: Object3D;
  spinVal: number = 0;
  fallVal: number = 0;
  valuation = input(0);
  valuationSignal: WritableSignal<number> = signal<number>(this.valuation());
  valuationReadable: number = this.valuationSignal().valueOf();

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
    this.diamondObj.position.setY(this.diamondObj.position.y - this.fall() * rand(0, 4000))
    this.diamondObj.rotateOnAxis(this.axis, this.spin() * rand(0, 1000))

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

  constructor(private lampService: LampService, private gemsService: GemsService) {
    
    effect(() => {
      this.initialPosition = this.position();
      this.fallVal = this.fall();
      this.spinVal = this.spin();
      
      this.valuationReadable = this.valuation();
      this.scaleReadable = this.scale();
      this.roughnessReadable = this.roughness();
      this.colorReadable = this.color();
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
          this.gemsService.addToRecentlyAdded({"type": classifyGem(this.colorReadable), "scale": this.scaleReadable, "roughness": this.roughnessReadable, "value": this.valuationReadable.toFixed(2), "timestamp": new Date()});
        }
      }
    });
  }
  
  randomize(colorOverride: Color | undefined = undefined) {
    let s = gemRandomScale();
    let c = colorPresetActivated(this.lampService.color, this.lampService.customColor) ? this.lampService.color : gemRandomColor();
    let r = gemRandomRoughness();
    this.rotationSignal.set([0,0,0]);
    this.fallSignal.set(gemRandomFall());
    this.spinSignal.set(gemRandomSpin());
    this.scaleSignal.set(s);
    this.scaleReadable = s;
    this.colorSignal.set(c);
    this.colorReadable = c;
    this.roughnessSignal.set(r);
    this.roughnessReadable = r;
    const newVal = calculateGemValue(s,c,r);
    this.valuationSignal.set(newVal);
    this.valuationReadable = newVal;
  }
}