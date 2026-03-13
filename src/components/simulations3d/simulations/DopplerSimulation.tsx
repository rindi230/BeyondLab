import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export const DopplerSimulation = () => {
  const sourceRef = useRef<THREE.Mesh>(null);
  const wavesRef = useRef<THREE.Group>(null);
  const sourcePosition = useRef(-5);
  const sourceVelocity = 2;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Move source
    sourcePosition.current = -5 + (time * sourceVelocity) % 10;
    
    if (sourceRef.current) {
      sourceRef.current.position.x = sourcePosition.current;
    }

    // Update wave rings
    if (wavesRef.current) {
      wavesRef.current.children.forEach((wave, i) => {
        const waveTime = (time + i * 0.3) % 3;
        const sourceAtEmission = -5 + ((time - waveTime) * sourceVelocity) % 10;
        
        // Wave expands from where source WAS
        const scale = waveTime * 2;
        wave.position.x = sourceAtEmission;
        wave.scale.set(scale, scale, 1);
        
        const mat = (wave as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.8 - waveTime * 0.3);
      });
    }
  });

  // Compressed waves (in front) vs stretched waves (behind)
  const observerFront = 5;
  const observerBehind = -8;

  return (
    <group>
      <Text position={[0, 5, 0]} fontSize={0.4} color="#888">
        Doppler Effect
      </Text>

      {/* Sound source (car/ambulance) */}
      <mesh ref={sourceRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.6, 0.8]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      <mesh position={[sourcePosition.current, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} color="#EF4444" distance={3} />

      {/* Sound waves */}
      <group ref={wavesRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1, 32]} />
            <meshBasicMaterial 
              color="#00BFFF" 
              transparent 
              opacity={0.5} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        ))}
      </group>

      {/* Observer in front (hears higher pitch) */}
      <group position={[observerFront, 0, 2]}>
        <mesh>
          <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
          <meshStandardMaterial color="#22C55E" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#22C55E" />
        </mesh>
        <Text position={[0, 1.3, 0]} fontSize={0.2} color="#22C55E">
          Higher pitch
        </Text>
        <Text position={[0, 1, 0]} fontSize={0.15} color="#666">
          f' {'>'} f
        </Text>
      </group>

      {/* Observer behind (hears lower pitch) */}
      <group position={[observerBehind, 0, 2]}>
        <mesh>
          <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
        <Text position={[0, 1.3, 0]} fontSize={0.2} color="#8B5CF6">
          Lower pitch
        </Text>
        <Text position={[0, 1, 0]} fontSize={0.15} color="#666">
          f' {'<'} f
        </Text>
      </group>

      {/* Direction arrow */}
      <group position={[0, -1.5, 0]}>
        <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#F59E0B" lineWidth={2} />
        <mesh position={[3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#F59E0B">
          Source motion
        </Text>
      </group>

      {/* Wave compression visualization */}
      <group position={[5, -3, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#22C55E">Compressed wavelength</Text>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[i * 0.3 - 0.6, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.1]} />
            <meshBasicMaterial color="#00BFFF" />
          </mesh>
        ))}
      </group>

      <group position={[-5, -3, 0]}>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#8B5CF6">Stretched wavelength</Text>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[i * 0.5 - 1, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.1]} />
            <meshBasicMaterial color="#00BFFF" />
          </mesh>
        ))}
      </group>

      {/* Formula */}
      <Text position={[0, -4.5, 0]} fontSize={0.2} color="#888">
        f' = f × (v ± v_observer) / (v ∓ v_source)
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[25, 10]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default DopplerSimulation;
