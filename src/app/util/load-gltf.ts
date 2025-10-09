import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type GLTFHandle = {
  root: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer?: THREE.AnimationMixer;
  update: (dt: number) => void;
  play: (name?: string) => void;
  stop: () => void;
  dispose: () => void;
};

export type LoadGLTFOptions = {
  onProgress?: (ratio: number) => void;
  center?: boolean;
  scaleTo?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  dracoDecoderPath?: string;
};

export function loadGLTF(url: string, opts: LoadGLTFOptions = {}): Promise<GLTFHandle> {
  const {
    onProgress,
    center = true,
    scaleTo,
    castShadow = true,
    receiveShadow = true,
  } = opts;

  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene || new THREE.Group();
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.castShadow = castShadow;
            mesh.receiveShadow = receiveShadow;
          }
        });

        if (center || scaleTo) {
          const box = new THREE.Box3().setFromObject(root);
          const size = new THREE.Vector3();
          const centerVec = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(centerVec);

          if (center) {
            root.position.addScaledVector(centerVec, -1);
          }

          if (scaleTo && scaleTo > 0) {
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scalar = scaleTo / maxDim;
            root.scale.setScalar(scalar);
          }
        }

        let mixer: THREE.AnimationMixer | undefined;
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(root);
        }

        const update = (dt: number) => {
          mixer?.update(dt);
        };

        const actions = new Map<string, THREE.AnimationAction>();
        const play = (name?: string) => {
          if (!mixer || !gltf.animations.length) return;
          const clip = name
            ? gltf.animations.find((c) => c.name === name)
            : gltf.animations[0];
          if (!clip) return;
          let action = actions.get(clip.name);
          if (!action) {
            action = mixer.clipAction(clip);
            actions.set(clip.name, action);
          }
          action.reset().fadeIn(0.2).play();
        };

        const stop = () => {
          actions.forEach((a) => a.stop());
        };

        const dispose = () => {
          stop();
          root.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if ((mesh as any).isMesh) {
              mesh.geometry?.dispose?.();
              const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
              const mats = Array.isArray(mat) ? mat : [mat];
              mats.filter(Boolean).forEach((m) => {
                if (!m) return;
                for (const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap','alphaMap','envMap','displacementMap','clearcoatMap','clearcoatRoughnessMap','clearcoatNormalMap','sheenColorMap','sheenRoughnessMap','specularMap','specularColorMap','specularIntensityMap','thicknessMap','transmissionMap']) {
                  const tex = (m as any)[key] as THREE.Texture | undefined;
                  tex?.dispose?.();
                }
                m.dispose();
              });
            }
          });
        };

        if (gltf.animations?.length) play();

        resolve({ root, animations: gltf.animations ?? [], mixer, update, play, stop, dispose });
      },
      (evt) => {
        if (onProgress && evt.lengthComputable) {
          onProgress(evt.loaded / evt.total);
        }
      },
      (err) => reject(err),
    );
  });
}
