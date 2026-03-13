import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const VolcanoSimulation = () => {
  const lavaRef = useRef<THREE.Points>(null);
  const smokeRef = useRef<THREE.Points>(null);
  const lavaFlowRef = useRef<THREE.Mesh>(null);

  const lavaCount = 200;
  const smokeCount = 300;

  const lavaPositions = useMemo(() => new Float32Array(lavaCount * 3), []);
  const lavaVelocities = useMemo(() => {
    const v = new Float32Array(lavaCount * 3);
    for (let i = 0; i < lavaCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 0.5;
      v[i * 3] = Math.cos(angle) * spread;
      v[i * 3 + 1] = 3 + Math.random() * 2;
      v[i * 3 + 2] = Math.sin(angle) * spread;
    }
    return v;
  }, []);
  const lavaLifetimes = useMemo(() => new Float32Array(lavaCount).fill(0), []);

  const smokePositions = useMemo(() => new Float32Array(smokeCount * 3), []);
  const smokeLifetimes = useMemo(() => new Float32Array(smokeCount).fill(0), []);

  useFrame((_, delta) => {
    // Update lava particles
    if (lavaRef.current) {
      const pos = lavaPositions;
      
      for (let i = 0; i < lavaCount; i++) {
        lavaLifetimes[i] += delta;
        
        if (lavaLifetimes[i] > 2 || pos[i * 3 + 1] < -0.5) {
          // Reset particle
          lavaLifetimes[i] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 0.3;
          pos[i * 3 + 1] = 3;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
          
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 0.5;
          lavaVelocities[i * 3] = Math.cos(angle) * spread;
          lavaVelocities[i * 3 + 1] = 3 + Math.random() * 2;
          lavaVelocities[i * 3 + 2] = Math.sin(angle) * spread;
        }
        
        // Apply gravity and velocity
        lavaVelocities[i * 3 + 1] -= 9.8 * delta;
        pos[i * 3] += lavaVelocities[i * 3] * delta;
        pos[i * 3 + 1] += lavaVelocities[i * 3 + 1] * delta;
        pos[i * 3 + 2] += lavaVelocities[i * 3 + 2] * delta;
      }
      
      lavaRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Update smoke particles
    if (smokeRef.current) {
      const pos = smokePositions;
      
      for (let i = 0; i < smokeCount; i++) {
        smokeLifetimes[i] += delta;
        
        if (smokeLifetimes[i] > 4) {
          smokeLifetimes[i] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 0.5;
          pos[i * 3 + 1] = 3.5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }
        
        pos[i * 3] += (Math.random() - 0.5) * 0.02;
        pos[i * 3 + 1] += delta * 2;
        pos[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
      }
      
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate lava flow
    if (lavaFlowRef.current) {
      const mat = lavaFlowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
    }
  });

  return (
    <group>
      <Text position={[0, 7, 0]} fontSize={0.4} color="#888">
        Volcanic Eruption
      </Text>

      {/* Volcano mountain */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[4, 5, 32]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Crater */}
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.8, 0.6, 0.8, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>

      {/* Magma glow in crater */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
        <meshStandardMaterial 
          color="#FF4500" 
          emissive="#FF4500" 
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight position={[0, 3, 0]} intensity={20} color="#FF4500" distance={8} />

      {/* Lava flow down the side */}
      <mesh ref={lavaFlowRef} position={[1.5, 0, 1]} rotation={[0.3, 0.8, 0.5]}>
        <planeGeometry args={[0.5, 4]} />
        <meshStandardMaterial 
          color="#FF4500" 
          emissive="#FF4500" 
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Erupting lava particles */}
      <points ref={lavaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lavaCount}
            array={lavaPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.15} 
          color="#FF6600" 
          transparent 
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Smoke/ash cloud */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeCount}
            array={smokePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.3} 
          color="#333" 
          transparent 
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      {/* Cross-section diagram */}
      <group position={[-5, 0, 0]}>
        <Text position={[0, 3, 0]} fontSize={0.2} color="#888">Cross Section</Text>
        
        {/* Magma chamber */}
        <mesh position={[0, -1, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
        <Text position={[0, -1, 0]} fontSize={0.15} color="white">Magma</Text>
        
        {/* Conduit */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 2, 16]} />
          <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
        <Text position={[0.5, 0.5, 0]} fontSize={0.12} color="#888">Conduit</Text>
      </group>

      {/* Labels */}
      <Text position={[4, 2, 0]} fontSize={0.2} color="#666" anchorX="left">
        Pyroclastic material
      </Text>
      <Text position={[4, 1.5, 0]} fontSize={0.2} color="#666" anchorX="left">
        Temp: 700-1200°C
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#2d4a2d" roughness={0.9} />
      </mesh>
    </group>
  );
};

export default VolcanoSimulation;
