
"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import "./UniverseScene.css";

export default function UniverseScene() {
  return (
    <div className="universe-scene">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <Stars
          radius={65}
          depth={35}
          count={1200}
          factor={2}
          fade
          speed={0.12}
        />
      </Canvas>
    </div>
  );
}
