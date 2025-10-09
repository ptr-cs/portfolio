import * as THREE from 'three';

export function disposeObject(obj: unknown): void {
  if (!(obj instanceof THREE.Object3D)) return;
  obj.traverse((child: any) => {
    child.geometry?.dispose?.();
    const mat = child.material;
    if (Array.isArray(mat)) mat.forEach(m => disposeMaterial(m));
    else if (mat) disposeMaterial(mat);
  });
}

export function disposeMaterial(mat: any): void {
  if (!mat) return;
  for (const k in mat) {
    const v = mat[k];
    if (v && typeof v === 'object' && (v.isTexture || v.isWebGLRenderTarget)) {
      v.dispose?.();
    }
  }
  mat.dispose?.();
}

export function getRandomColor(): THREE.Color {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

export function centerAtWorldOrigin(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
}