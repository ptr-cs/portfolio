import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, input, ViewChild } from '@angular/core';
import { applyProps, injectBeforeRender, NgtArgs, NgtMesh } from 'angular-three';
import { injectGLTF } from 'angular-three-soba/loaders';
import { Subscription } from 'rxjs';
import { AnimationMixer, Box3, BufferGeometry, Color, ColorRepresentation, DoubleSide, Material, MathUtils, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { MarchingCubes, SkeletonUtils } from 'three-stdlib';
import TinyColor from "tinycolor2";
import { LampService, PRESET_HEX } from '../../services/lamp.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'lava-lamp',
  template: `
		<ngt-group [position]="position()" [rotation]="rotation()" [scale]="scale()">
      <ngt-primitive *args="[model()]" />
      <ngt-mesh #meshRef [position]="[0,-.05,0]">
        <ngt-sphere-geometry *args="[.08, 24, 24]"/>
        <ngt-mesh-physical-material
          [toneMapped]="true"
          [castShadow]="true"
          [emissive]="waxColor"
          [color]="waxColor"
          [emissiveIntensity]="6" 
          [roughness]="0.5"
          [metalness]="0"
          [transmission]="1"
          [ior]="2"
          [thickness]=".5"
          [attenuationColor]="waxAttenuationColor"
          [attenuationDistance]="2"
          [envMapIntensity]="1"
          [sheen]="0.6"
          [sheenRoughness]="0.7"></ngt-mesh-physical-material>
      </ngt-mesh>
    </ngt-group>
	`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtArgs],
})
export class LavaLamp {
  DoubleSide = DoubleSide;
  TAPER_START = 0.60;
  TAPER_END = 0.90;
  TAPER_TOP_SCALE_X = 0.55;
  TAPER_TOP_SCALE_Z = 0.55;
  INV_TAPER_RANGE = 1 / (this.TAPER_END - this.TAPER_START);
  waxStrength = 0.6;
  waxSubtract = 10;
  nxOld = 0
  nyOld = 0
  nzOld = 0

  position = input([0, 0, 0]);
  color = input(new Color(PRESET_HEX.blue));
  rotation = input([0, 0, 0]);
  scale = input(1);
  waxResolution = input(32);
  waxIsolation = input(32);
  waxMatEmissiveIntensity = input(5);
  waxEnableColor = input(true);
  waxMaxPolygons = input(4000);
  limitUpdates = input(false);
  waxBoundsTopOffset = input(0);
  private lampSub?: Subscription;
  backCapMesh? = new Mesh;
  public waxIso?: MarchingCubes;
  public waxEmitters: Object3D[] = [];
  public glassObj?: Object3D;
  public waxLocalMin = new Vector3();
  public waxLocalSize = new Vector3();

  public waxColor = new Color(PRESET_HEX.blue);
  public waxColorHex = this.waxColor.getHexString();
  public waxAttenuationColor = new Color(new TinyColor(this.waxColorHex).brighten(10).toHexString());
  public waxEmmissiveColor = new Color(new TinyColor(this.waxColorHex).brighten(10).toHexString());
  public glassColor = new Color(new TinyColor(this.waxColorHex).darken(17).toHexString());

  public waxMat: MeshPhysicalMaterial = new MeshPhysicalMaterial();

  private mixer?: AnimationMixer;

  gltf = injectGLTF(() => environment.lampUrl);

  @ViewChild('meshRef') meshRef?: NgtMesh;
  protected model = computed(() => {
    const gltf = this.gltf();
    
    if (!gltf) return null;
    
    if (environment.lampUrl.includes('placeholder')) {
      return gltf.scene;
    }

    const root = SkeletonUtils.clone((gltf as any).scene) as Object3D;
    const { materials } = gltf;

    applyProps(materials['Metal'], { metalness: .95, roughness: .4, envMapIntesity: 1, clearcoat: .7, clearcoatRoughness: .25, specularIntesity: 1, specularColor: new Color(0xffffff) });
    applyProps(materials['Glass'], { transparent: true, opacity: 1, transmission: 0, thickness: .2, ior: 1.5, envMapIntensity: 1, metalness: 0, attenuationDistance: 2, roughness: .1 });

    const metalObj = root.children.find(c => c.name === 'Lava_Lamp');
    if (metalObj && metalObj instanceof Mesh) {
      metalObj.receiveShadow = false;
      metalObj.castShadow = false;
    }

    const glassObj = root.children.find(c => c.name === 'Glass');
    if (glassObj && glassObj instanceof Mesh) {
      glassObj.receiveShadow = false;
      glassObj.castShadow = false;
    }

    this.recomputeColors(this.color());
    this.bindCloneRefs(root);

    if ((gltf as any).animations && (gltf as any).animations.length) {
      this.mixer = new AnimationMixer(root);
      for (const clip of (gltf as any).animations) {
        this.mixer.clipAction(clip, root).time = Math.random() * clip.duration;
        this.mixer.clipAction(clip, root).play();
      }
    }

    if (this.meshRef) {
      const mesh = (this.meshRef as any).nativeElement;
      (mesh.material as MeshStandardMaterial)!.color = this.waxColor;
      (mesh.material as MeshStandardMaterial)!.emissive = this.waxColor;
    }

    return root;
  });

  constructor(private lampService: LampService) {
    effect(() => {
      const gltf = this.gltf();
      if (!gltf) return;
    });

    injectBeforeRender(({ delta }) => {
      this.mixer?.update(delta);
      this.updateWax();
    });



  }

  resetColors(c: Color | null) {
    if (c)
      this.recomputeColors(c);
    
    this.color().set(c!);
    this.waxMat.color = this.waxColor;
    this.waxMat.attenuationColor = this.waxAttenuationColor;
    this.waxMat.emissive = this.waxEmmissiveColor;

    this.setGlassTint(this.glassColor, 0.25);

    if (this.meshRef) {
      const mesh = (this.meshRef as any).nativeElement;
      (mesh.material as MeshStandardMaterial)!.color = this.waxColor;
      (mesh.material as MeshStandardMaterial)!.emissive = this.waxColor;
    }
  }

  ngAfterViewInit() {
    this.lampSub = this.lampService.color$.subscribe(c => {
      if (this.waxColor != c && this.lampService.type !== 'none') {
        this.resetColors(c);
      }
    });
  }

  private getLocalBounds(obj: Object3D): { min: Vector3; size: Vector3 } {
    if ((obj as any).isMesh) {
      const mesh = obj as Mesh;
      const geo = mesh.geometry as BufferGeometry | undefined;
      if (geo) {
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        if (bb) {
          const min = bb.min.clone();
          const size = bb.getSize(new Vector3());
          return { min, size };
        }
      }
    }

    obj.updateWorldMatrix(true, false);
    const worldBox = new Box3().setFromObject(obj);
    const inv = new Matrix4().copy(obj.matrixWorld).invert();

    const corners = this.getBoxCorners(worldBox).map(v => v.applyMatrix4(inv));
    const localMin = new Vector3(
      Math.min(...corners.map(v => v.x)),
      Math.min(...corners.map(v => v.y)),
      Math.min(...corners.map(v => v.z))
    );
    const localMax = new Vector3(
      Math.max(...corners.map(v => v.x)),
      Math.max(...corners.map(v => v.y)),
      Math.max(...corners.map(v => v.z))
    );
    const size = localMax.clone().sub(localMin);
    return { min: localMin, size };
  }

  private getBoxCorners(b: Box3): Vector3[] {
    const { min, max } = b;
    return [
      new Vector3(min.x, min.y, min.z),
      new Vector3(max.x, min.y, min.z),
      new Vector3(min.x, max.y, min.z),
      new Vector3(max.x, max.y, min.z),
      new Vector3(min.x, min.y, max.z),
      new Vector3(max.x, min.y, max.z),
      new Vector3(min.x, max.y, max.z),
      new Vector3(max.x, max.y, max.z)
    ];
  }

  private ensureNonZeroSize(size: Vector3, eps: number, fallback: number): void {
    for (const axis of ['x', 'y', 'z'] as const) {
      if (size[axis] < eps) size[axis] = fallback;
    }
  }

  private asMaterialArray(mat: Material | Material[]): Material[] {
    return Array.isArray(mat) ? mat : [mat];
  }

  public setGlassTint(tint: ColorRepresentation, opacity: number): void {
    const mesh = this.glassObj as Mesh | undefined;
    if (!mesh || !mesh.material) return;

    const mats = this.asMaterialArray(mesh.material) as MeshPhysicalMaterial[];
    const tintColor = new Color(tint);
    const mat = mats.find(m => m.name.toLowerCase() === "glass");
    if (mat === undefined) return;

    if ((mat as any).color) (mat as any).color.set(tintColor);
    if ((mat as any).attenuationColor) (mat as any).attenuationColor.set(tintColor);
    if ((mat as any).emissive) (mat as any).emissive.set(tintColor);
    mat.opacity = opacity;
    mat.transparent = opacity < 1.0 || !!(mat as any).transmission || !!(mat as any).attenuationColor;
    mat.depthWrite = !mat.transparent;
    mat.needsUpdate = true;
  }

  private bindCloneRefs(root: Object3D) {
    this.glassObj = root.getObjectByName('Glass') ?? root.getObjectByName('glass');
    this.glassObj!.traverse((o: any) => {
      if (!o?.isMesh || !o.material) return;
      o.material = Array.isArray(o.material)
        ? o.material.map((m: any) => (m as MeshPhysicalMaterial).clone())
        : (o.material as MeshPhysicalMaterial).clone();
    });

    this.waxEmitters = [];
    root.traverse((o: any) => {
      if (o.name?.startsWith('Mball') || o.userData?.waxEmitter) this.waxEmitters.push(o);
    });

    if (!this.waxIso) {

      const { min, size } = this.getLocalBounds(this.glassObj!);
      this.waxLocalMin.copy(min);
      this.waxLocalSize.copy(size);
      this.ensureNonZeroSize(this.waxLocalSize, 1e-6, 1.0);

      this.setGlassTint(this.glassColor, 0.25);

      const resolution = this.waxResolution();
      this.waxMat = new MeshPhysicalMaterial({
        color: this.waxColor,
        roughness: 0.5,
        metalness: 0,
        transmission: 1,
        ior: 1.5,
        thickness: .5,
        attenuationColor: this.waxAttenuationColor,
        attenuationDistance: 2,
        envMapIntensity: 3,
      });
      (this.waxMat as any).sheen = 0.6;
      (this.waxMat as any).sheenRoughness = 0.7;
      this.waxMat.emissive.set(this.waxEmmissiveColor);
      (this.waxMat as any).emissiveIntensity = this.waxMatEmissiveIntensity();
      (this.waxMat as any).toneMapped = true;
      this.waxMat.needsUpdate = true;

      const iso = new MarchingCubes(resolution, this.waxMat, false, this.waxEnableColor(), this.waxMaxPolygons());
      iso.isolation = this.waxIsolation();
      iso.frustumCulled = true;
      iso.position.copy(this.waxLocalMin);
      iso.scale.copy(this.waxLocalSize);

      iso.position.add(new Vector3(0.15, 0.25, 0.15));
      iso.scale.sub(new Vector3(0.13, 0.1 + this.waxBoundsTopOffset(), 0.13));
      iso.receiveShadow = false;
      iso.castShadow = false;
      this.waxIso = iso;

      (this.glassObj ?? root).add(this.waxIso);
    }

    if (this.glassObj) {
      const bbox = new Box3().setFromObject(this.glassObj);
      this.waxLocalMin.copy(bbox.min);
      this.waxLocalSize.subVectors(bbox.max, bbox.min);
    }
  }

  public isWithinPercent(newValue: number, oldValue: number, percentDecimal: number) {
    return Math.abs(newValue - oldValue) <= Math.abs(oldValue) * percentDecimal;
  }

  public updateWax(): void {
    if (!this.waxIso || !this.glassObj) return;

    this.waxIso.reset();

    if (this.waxEmitters.length === 0) {
      this.waxIso.addBall(0.5, 0.5, 0.5, this.waxStrength, this.waxSubtract);
    } else {
      const { x: minX, y: minY, z: minZ } = this.waxLocalMin;
      const { x: sizeX, y: sizeY, z: sizeZ } = this.waxLocalSize;
      const v = new Vector3();

      for (let i = 0; i < this.waxEmitters.length; i++) {
        const emitter = this.waxEmitters[i];

        emitter.getWorldPosition(v);
        this.glassObj.worldToLocal(v);

        let nx = (v.x - minX) / sizeX;
        let ny = (v.y - minY) / sizeY;
        let nz = (v.z - minZ) / sizeZ;

        nx = MathUtils.clamp(nx, 0, 1);
        ny = MathUtils.clamp(ny, 0, 1);
        nz = MathUtils.clamp(nz, 0, 1);

        let t = 0;
        if (ny >= this.TAPER_START) t = MathUtils.clamp((ny - this.TAPER_START) * this.INV_TAPER_RANGE, 0, 1);
        const sX = this.TAPER_TOP_SCALE_X + (1 - this.TAPER_TOP_SCALE_X) * (1 - t) - .5;
        const sZ = this.TAPER_TOP_SCALE_Z + (1 - this.TAPER_TOP_SCALE_Z) * (1 - t) - .5;

        nx = MathUtils.clamp(0.5 + (nx - 0.5) * sX, 0, 1);
        nz = MathUtils.clamp(0.5 + (nz - 0.5) * sZ, 0, 1);

        if (this.limitUpdates() === true) {
          if (!this.isWithinPercent(nx, this.nxOld, .05) || !this.isWithinPercent(ny, this.nyOld, .05) || !this.isWithinPercent(nz, this.nzOld, .05)) {
            this.waxIso.addBall(nx, ny, nz, this.waxStrength, this.waxSubtract);
            this.waxIso.update();
          }

          this.nxOld = nx;
          this.nyOld = ny;
          this.nzOld = nz;
        } else {
          this.waxIso.addBall(nx, ny, nz, this.waxStrength, this.waxSubtract);
          this.waxIso.update();
        }
      }

      this.waxIso.addBall(1.7, -0.1, 2, this.waxStrength, this.waxSubtract);
    }
  }

  recomputeColors(c: Color) {
    this.waxColorHex = c.getHexString();
    this.waxColor = c;
    this.waxAttenuationColor = new Color(new TinyColor(this.waxColorHex).brighten(10).toHexString());
    this.waxEmmissiveColor = new Color(new TinyColor(this.waxColorHex).brighten(10).toHexString());
    this.glassColor = new Color(new TinyColor(this.waxColorHex).darken(17).toHexString());
  }

  ngOnDestroy() {
    this.lampSub?.unsubscribe();
  }
}