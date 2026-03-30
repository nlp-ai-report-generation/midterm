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
  intensity?: number;
  changeBoost?: number;
  variant?: "live" | "summary";
}

/**
 * 5-stop heatmap: cool grey → warm beige → cream → orange → deep red
 * Wider spectrum than original 3-stop for better low-mid differentiation
 */
function heatColor(value: number, intensity = 0.5, changeBoost = 0.5, variant: "live" | "summary" = "live"): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, value));
  const contrast = 1.08 + changeBoost * 0.42;
  const shifted = 0.12 + intensity * 0.14;
  const normalized = Math.max(0, Math.min(1, (clamped - 0.24) * contrast + shifted));
  const boosted = variant === "summary"
    ? Math.round(Math.pow(normalized, 0.62) * 4) / 4
    : Math.pow(normalized, 0.68);

  // Stop 1: cool grey (inactive)
  if (boosted < 0.2) {
    const r = boosted / 0.2;
    return [0.90 + r * 0.02, 0.93 - r * 0.01, 0.97 - r * 0.03];
  }
  // Stop 2: warm beige
  if (boosted < 0.4) {
    const r = (boosted - 0.2) / 0.2;
    return [0.92 + r * 0.08, 0.92 - r * 0.04, 0.94 - r * 0.14];
  }
  // Stop 3: cream → orange transition
  if (boosted < 0.6) {
    const r = (boosted - 0.4) / 0.2;
    return [1.0, 0.88 - r * 0.28, 0.80 - r * 0.56];
  }
  // Stop 4: orange → deep orange
  if (boosted < 0.8) {
    const r = (boosted - 0.6) / 0.2;
    return [1.0 - r * 0.05, 0.60 - r * 0.28, 0.24 - r * 0.14];
  }
  // Stop 5: deep orange → red
  const r = (boosted - 0.8) / 0.2;
  return [
    0.95 - r * (variant === "summary" ? 0.08 : 0.10),
    0.32 - r * (variant === "summary" ? 0.12 : 0.15),
    0.10 - r * (variant === "summary" ? 0.03 : 0.04),
  ];
}

function paintMesh(
  mesh: Mesh,
  values: number[] | undefined,
  intensity = 0.5,
  changeBoost = 0.5,
  variant: "live" | "summary" = "live",
) {
  if (!values?.length) return;
  const positions = mesh.geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);

  for (let idx = 0; idx < positions.count; idx += 1) {
    const [r, g, b] = heatColor(values[idx % values.length] ?? 0.5, intensity, changeBoost, variant);
    colors[idx * 3] = r;
    colors[idx * 3 + 1] = g;
    colors[idx * 3 + 2] = b;
  }

  mesh.geometry.setAttribute("color", new BufferAttribute(colors, 3));
  mesh.geometry.attributes.color.needsUpdate = true;

  mesh.material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: variant === "summary" ? 0.84 : 0.92,
    metalness: 0,
    flatShading: variant === "summary",
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

function BrainModel({ meshUrl, colors, intensity, changeBoost, variant = "live" }: BrainCanvasProps) {
  const { scene } = useGLTF(meshUrl);
  const paintedScene = useMemo(() => scene.clone(true), [scene]);
  const outlineScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.material = new MeshStandardMaterial({
        color: variant === "summary" ? "#fff6ef" : "#fff8f2",
        roughness: 1,
        metalness: 0,
        side: BackSide,
      });
      child.scale.setScalar(variant === "summary" ? 1.012 : 1.018);
    });
    return clone;
  }, [scene, variant]);

  useEffect(() => {
    if (!colors) return;
    const left = findMesh(paintedScene, "left_hemisphere");
    const right = findMesh(paintedScene, "right_hemisphere");
    if (left) paintMesh(left, colors.left, intensity, changeBoost, variant);
    if (right) paintMesh(right, colors.right, intensity, changeBoost, variant);
  }, [paintedScene, colors, intensity, changeBoost, variant]);

  return (
    <Float
      speed={variant === "summary" ? 0.9 : 1.2}
      rotationIntensity={variant === "summary" ? 0.12 : 0.18}
      floatIntensity={variant === "summary" ? 0.11 : 0.18}
    >
      <group
        position={variant === "summary" ? [0, -0.08, 0.03] : [0, -0.1, 0.03]}
        rotation={variant === "summary" ? [0.2, -0.22, 0.02] : [0.18, -0.28, 0.04]}
        scale={variant === "summary" ? [0.0196, 0.0191, 0.0166] : [0.0188, 0.0182, 0.0158]}
      >
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

export default function BrainCanvas({ meshUrl, colors, intensity, changeBoost, variant = "live" }: BrainCanvasProps) {
  return (
    <Canvas camera={{ position: variant === "summary" ? [0, 0.14, 5.1] : [0, 0.2, 4.9], fov: variant === "summary" ? 32 : 34 }}>
      <color attach="background" args={[variant === "summary" ? "#faf7f2" : "#f7f8fb"]} />
      <ambientLight intensity={variant === "summary" ? 1.18 : 1.35} />
      <directionalLight position={[3.2, 4.4, 4.6]} intensity={variant === "summary" ? 1.25 : 1.45} color="#fff5eb" />
      <directionalLight position={[-4.5, 0.8, 2.6]} intensity={variant === "summary" ? 0.62 : 0.9} color="#ffd9bf" />
      <directionalLight position={[0, -3.2, 2.4]} intensity={variant === "summary" ? 0.18 : 0.35} color="#ffffff" />
      <Suspense fallback={<LoadingState />}>
        <BrainModel meshUrl={meshUrl} colors={colors} intensity={intensity} changeBoost={changeBoost} variant={variant} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        autoRotate
        enableRotate={variant !== "summary"}
        enableZoom={variant !== "summary"}
        autoRotateSpeed={variant === "summary" ? 0.56 : 0.8}
        minDistance={variant === "summary" ? 4.5 : 3.3}
        maxDistance={variant === "summary" ? 5.8 : 6.7}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 1.75}
      />
    </Canvas>
  );
}

useGLTF.preload("/data/simulations/brain-mesh.glb");
