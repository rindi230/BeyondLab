import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const TornadoSimulation = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const debrisRef = useRef<THREE.Group>(null);

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const height = Math.random() * 10;
      const radius = 0.3 + height * 0.3;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height - 3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  const particleAngles = useMemo(() => {
    return new Float32Array(particleCount).map(() => Math.random() * Math.PI * 2);
  }, []);

  const particleHeights = useMemo(() => {
    return new Float32Array(particleCount).map(() => Math.random() * 10);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += delta * (3 + particleHeights[i] * 0.2);
        particleHeights[i] += delta * 2;

        if (particleHeights[i] > 10) {
          particleHeights[i] = 0;
          particleAngles[i] = Math.random() * Math.PI * 2;
        }

        const height = particleHeights[i];
        const radius = 0.3 + height * 0.3 + Math.sin(height * 2 + time) * 0.2;

        pos[i * 3] = Math.cos(particleAngles[i]) * radius;
        pos[i * 3 + 1] = height - 3;
        pos[i * 3 + 2] = Math.sin(particleAngles[i]) * radius;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Rotate debris
    if (debrisRef.current) {
      debrisRef.current.children.forEach((debris, i) => {
        const angle = time * 2 + i * 0.5;
        const height = ((time * 0.5 + i * 2) % 8) - 2;
        const radius = 1 + height * 0.25;

        debris.position.x = Math.cos(angle) * radius;
        debris.position.y = height;
        debris.position.z = Math.sin(angle) * radius;
        debris.rotation.x += delta * 3;
        debris.rotation.z += delta * 2;
      });
    }
  });

  return (
    <group>
      <Text position={[0, 6, 0]} fontSize={0.4} color="#888">
        Tornado Formation
      </Text>

      {/* Funnel cloud particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#555"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Core funnel visualization */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[3, 8, 32, 1, true]} />
        <meshStandardMaterial
          color="#333"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Debris */}
      <group ref={debrisRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.2 + Math.random() * 0.2, 0.1, 0.15 + Math.random() * 0.1]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#8B4513' : i % 3 === 1 ? '#228B22' : '#666'} />
          </mesh>
        ))}
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2d4a2d" roughness={0.9} />
      </mesh>

      {/* Dust ring at base */}
      <mesh position={[0, -2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 4, 32]} />
        <meshBasicMaterial color="#8B7355" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Cloud base */}
      <mesh position={[0, 5.5, 0]}>
        <sphereGeometry args={[6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Labels */}
      <group position={[5, 2, 0]}>
        <Text position={[0, 1, 0]} fontSize={0.2} color="#888" anchorX="left">
          Rotating updraft
        </Text>
        <Text position={[0, 0.6, 0]} fontSize={0.2} color="#888" anchorX="left">
          (mesocyclone)
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.2} color="#666" anchorX="left">
          Wind speed: 100-300 mph
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#666" anchorX="left">
          Pressure drop at center
        </Text>
      </group>

      {/* Wind direction arrows */}
      {[0, 1, 2, 3].map((i) => {
        const angle = i * Math.PI / 2;
        return (
          <group key={i} position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]} rotation={[0, -angle - Math.PI / 2, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshBasicMaterial color="#00BFFF" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default TornadoSimulation;
