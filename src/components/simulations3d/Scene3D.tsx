import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, ContactShadows, MeshReflectorMaterial, Float } from '@react-three/drei';
import { Suspense, ReactNode } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  children: ReactNode;
  showStars?: boolean;
  cameraPosition?: [number, number, number];
  enableOrbitControls?: boolean;
}

const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#8B5CF6" wireframe />
  </mesh>
);

export const Scene3D = ({
  children,
  showStars = true,
  cameraPosition = [0, 5, 15],
  enableOrbitControls = true
}: Scene3DProps) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      camera={{ position: cameraPosition, fov: 60 }}
    >
      <color attach="background" args={['#050505']} />

      <Suspense fallback={<LoadingFallback />}>
        {/* Lighting - High quality lighting setup */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8B5CF6" />

        {/* Premium Environment - This adds the realistic reflections */}
        <Environment preset="city" />

        {/* Reflector Floor - This is a massive "Wow" factor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
            mirror={0.5}
          />
        </mesh>

        <ContactShadows
          resolution={1024}
          position={[0, -4.9, 0]}
          opacity={1}
          scale={10}
          blur={2}
          far={10}
        />

        {/* Environment Stars */}
        {showStars && (
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
          </Float>
        )}

        {/* Controls */}
        {enableOrbitControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={50}
            makeDefault
          />
        )}

        {/* Simulation Content */}
        <group position={[0, -1, 0]}>
          {children}
        </group>
      </Suspense>
    </Canvas>
  );
};

export default Scene3D;
