import * as THREE from 'three';

export function getRandomColor(): THREE.Color {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

export function centerAtWorldOrigin(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
}