import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface BlackHoleProps {
  mass?: number;
  rotation?: number;
}

export const BlackHoleSimulation = ({
  mass = 4.1, // Initial mass in solar masses
  rotation = 0.5
}: BlackHoleProps) => {
  const accretionRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Scale factor based on mass (Schwarzschild radius logic)
  const scale = useMemo(() => mass / 4.1, [mass]);

  // Generate particles for accretion disk
  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.3;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color gradient from orange to blue based on distance
      const t = (radius - 2) / 4;
      colors[i * 3] = 1 - t * 0.5;     // R
      colors[i * 3 + 1] = 0.5 - t * 0.3; // G
      colors[i * 3 + 2] = t;           // B

      sizes[i] = Math.random() * 0.05 + 0.02;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state, delta) => {
    if (accretionRef.current) {
      accretionRef.current.rotation.y += delta * rotation;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);

        // Spiral inward
        const newRadius = radius - delta * 0.1;
        const newAngle = angle + delta * (3 / radius);

        if (newRadius < 1.5) {
          // Respawn at edge
          const spawnRadius = 5 + Math.random() * 1;
          const spawnAngle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.cos(spawnAngle) * spawnRadius;
          positions[i * 3 + 2] = Math.sin(spawnAngle) * spawnRadius;
        } else {
          positions[i * 3] = Math.cos(newAngle) * newRadius;
          positions[i * 3 + 2] = Math.sin(newAngle) * newRadius;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group scale={scale}>
      {/* Black Hole Core */}
      <Sphere args={[1.2, 64, 64]} castShadow receiveShadow>
        <meshStandardMaterial color="#000000" roughness={0} metalness={1} />
      </Sphere>

      {/* The Glow - Using a custom sprite-based glow for maximum stability and WOW */}
      <Sparkles count={100} scale={4} size={4} speed={0.4} color="#8B00FF" />
      <Sparkles count={50} scale={2} size={6} speed={0.2} color="#F59E0B" />

      {/* Photon sphere glow - Optimized for Standard material */}
      <Sphere args={[1.4, 64, 64]}>
        <meshStandardMaterial
          color="#4B0082"
          emissive="#8B00FF"
          emissiveIntensity={2}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Gravitational lensing effect with high-intensity material */}
      <Ring args={[1.3, 1.6, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#8B00FF"
          emissive="#8B00FF"
          emissiveIntensity={3}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>

      {/* Accretion disk rings with premium materials */}
      <group ref={accretionRef}>
        {[0, 1, 2, 3].map((i) => (
          <Ring
            key={i}
            args={[2 + i * 0.8, 2.5 + i * 0.8, 64]}
            rotation={[Math.PI / 2.2, 0, 0]}
          >
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.08 - i * 0.02, 1, 0.5)}
              emissive={new THREE.Color().setHSL(0.08 - i * 0.02, 1, 0.5)}
              emissiveIntensity={1.5 - i * 0.3}
              transparent
              opacity={0.7 - i * 0.1}
              side={THREE.DoubleSide}
              metalness={0.8}
              roughness={0.2}
            />
          </Ring>
        ))}
      </group>

      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Relativistic Jets */}
      <JetBeam direction={1} />
      <JetBeam direction={-1} />

      <pointLight position={[0, 0, 0]} intensity={10} color="#8B00FF" distance={10} decay={2} />
    </group>
  );
};

const JetBeam = ({ direction }: { direction: number }) => {
  const jetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (jetRef.current) {
      jetRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={jetRef} position={[0, direction * 5, 0]} rotation={[0, 0, 0]}>
      <coneGeometry args={[0.3, 8, 32]} />
      <meshStandardMaterial
        color="#00BFFF"
        emissive="#00BFFF"
        emissiveIntensity={2}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
};

export default BlackHoleSimulation;
