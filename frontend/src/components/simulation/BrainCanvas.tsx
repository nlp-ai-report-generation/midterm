import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Html, OrbitControls, useGLTF } from "@react-three/drei";
import {
  BackSide,
  BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";

interface BrainCanvasProps {
  meshUrl: string;
  colors?: {
    left: number[];
    right: number[];
  };
}

function heatColor(value: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, value));
  const boosted = Math.pow(clamped, 0.78);

  if (boosted < 0.36) {
    const ratio = boosted / 0.36;
    return [
      0.92 + (1.0 - 0.92) * ratio,
      0.94 + (0.86 - 0.94) * ratio,
      0.96 + (0.78 - 0.96) * ratio,
    ];
  }

  if (boosted < 0.72) {
    const ratio = (boosted - 0.36) / 0.36;
    return [
      1.0 + (1.0 - 1.0) * ratio,
      0.86 + (0.56 - 0.86) * ratio,
      0.78 + (0.16 - 0.78) * ratio,
    ];
  }

  const ratio = (boosted - 0.72) / 0.28;
  return [
    1.0 + (0.87 - 1.0) * ratio,
    0.56 + (0.23 - 0.56) * ratio,
    0.16 + (0.06 - 0.16) * ratio,
  ];
}

function paintMesh(mesh: Mesh, values: number[] | undefined) {
  if (!values?.length) return;
  const positions = mesh.geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);

  for (let idx = 0; idx < positions.count; idx += 1) {
    const [r, g, b] = heatColor(values[idx % values.length] ?? 0.5);
    colors[idx * 3] = r;
    colors[idx * 3 + 1] = g;
    colors[idx * 3 + 2] = b;
  }

  mesh.geometry.setAttribute("color", new BufferAttribute(colors, 3));
  mesh.geometry.attributes.color.needsUpdate = true;

  mesh.material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
}

function findMesh(root: Object3D, name: string): Mesh | null {
  let match: Mesh | null = null;
  root.traverse((child) => {
    if (child instanceof Mesh && child.name === name) {
      match = child;
    }
  });
  return match;
}

function BrainModel({ meshUrl, colors }: BrainCanvasProps) {
  const { scene } = useGLTF(meshUrl);
  const paintedScene = useMemo(() => scene.clone(true), [scene]);
  const outlineScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.material = new MeshStandardMaterial({
        color: "#fff8f2",
        roughness: 1,
        metalness: 0,
        side: BackSide,
      });
      child.scale.setScalar(1.018);
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    if (!colors) return;
    const left = findMesh(paintedScene, "left_hemisphere");
    const right = findMesh(paintedScene, "right_hemisphere");
    if (left) paintMesh(left, colors.left);
    if (right) paintMesh(right, colors.right);
  }, [paintedScene, colors]);

  return (
    <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.18}>
      <group position={[0, -0.1, 0.03]} rotation={[0.18, -0.28, 0.04]} scale={[0.0188, 0.0182, 0.0158]}>
        <primitive object={outlineScene as Group} />
        <primitive object={paintedScene as Group} />
      </group>
    </Float>
  );
}

function LoadingState() {
  return (
    <Html center>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.92)",
          color: "var(--text-secondary)",
          boxShadow: "var(--shadow-card)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        fsaverage5 메쉬 불러오는 중...
      </div>
    </Html>
  );
}

export default function BrainCanvas({ meshUrl, colors }: BrainCanvasProps) {
  return (
    <Canvas camera={{ position: [0, 0.2, 4.9], fov: 34 }}>
      <color attach="background" args={["#f7f8fb"]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[3.2, 4.4, 4.6]} intensity={1.45} color="#fff5eb" />
      <directionalLight position={[-4.5, 0.8, 2.6]} intensity={0.9} color="#ffd9bf" />
      <directionalLight position={[0, -3.2, 2.4]} intensity={0.35} color="#ffffff" />
      <Suspense fallback={<LoadingState />}>
        <BrainModel meshUrl={meshUrl} colors={colors} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minDistance={3.3}
        maxDistance={6.7}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 1.75}
      />
    </Canvas>
  );
}

useGLTF.preload("/data/simulations/brain-mesh.glb");
