import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

export const EMWaveSimulation = () => {
  const waveRef = useRef<THREE.Group>(null);
  const photonRef = useRef<THREE.Mesh>(null);

  // Generate wave points
  const waveSegments = 100;
  const wavelength = 2;
  const amplitude = 1;

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (waveRef.current) {
      // Animate electric field (vertical)
      const electricWave = waveRef.current.children[0] as THREE.Line;
      if (electricWave) {
        const positions = (electricWave.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
        for (let i = 0; i <= waveSegments; i++) {
          const x = (i / waveSegments) * 10 - 5;
          const y = Math.sin((x / wavelength) * Math.PI * 2 - time * 3) * amplitude;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = 0;
        }
        electricWave.geometry.attributes.position.needsUpdate = true;
      }

      // Animate magnetic field (horizontal, perpendicular)
      const magneticWave = waveRef.current.children[1] as THREE.Line;
      if (magneticWave) {
        const positions = (magneticWave.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
        for (let i = 0; i <= waveSegments; i++) {
          const x = (i / waveSegments) * 10 - 5;
          const z = Math.sin((x / wavelength) * Math.PI * 2 - time * 3) * amplitude;
          positions[i * 3] = x;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = z;
        }
        magneticWave.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Photon traveling along the wave
    if (photonRef.current) {
      const x = ((time * 2) % 10) - 5;
      photonRef.current.position.x = x;
    }
  });

  const electricPoints = useMemo(() => new Float32Array((waveSegments + 1) * 3), []);
  const magneticPoints = useMemo(() => new Float32Array((waveSegments + 1) * 3), []);

  return (
    <group>
      <Text position={[0, 4, 0]} fontSize={0.4} color="#888">
        Electromagnetic Wave
      </Text>

      <group ref={waveRef}>
        {/* Electric field wave (E) */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={waveSegments + 1}
              array={electricPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#EF4444" linewidth={2} />
        </line>

        {/* Magnetic field wave (B) */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={waveSegments + 1}
              array={magneticPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#3B82F6" linewidth={2} />
        </line>
      </group>

      {/* Propagation axis */}
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="#666" lineWidth={1} dashed />
      <mesh position={[6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#666" />
      </mesh>
      <Text position={[6.5, 0, 0]} fontSize={0.2} color="#666">x</Text>

      {/* E field axis */}
      <Line points={[[0, -1.5, 0], [0, 1.5, 0]]} color="#EF4444" lineWidth={1} dashed />
      <Text position={[0.3, 1.5, 0]} fontSize={0.2} color="#EF4444">E</Text>

      {/* B field axis */}
      <Line points={[[0, 0, -1.5], [0, 0, 1.5]]} color="#3B82F6" lineWidth={1} dashed />
      <Text position={[0.3, 0, 1.5]} fontSize={0.2} color="#3B82F6">B</Text>

      {/* Photon */}
      <Sphere ref={photonRef} args={[0.15, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={1}
        />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFFF00" distance={1} />

      {/* Legend */}
      <group position={[-5, 2.5, 0]}>
        <Line points={[[0, 0, 0], [0.5, 0, 0]]} color="#EF4444" lineWidth={3} />
        <Text position={[0.8, 0, 0]} fontSize={0.15} color="#EF4444" anchorX="left">
          Electric field (E)
        </Text>
        
        <Line points={[[0, -0.3, 0], [0.5, -0.3, 0]]} color="#3B82F6" lineWidth={3} />
        <Text position={[0.8, -0.3, 0]} fontSize={0.15} color="#3B82F6" anchorX="left">
          Magnetic field (B)
        </Text>
      </group>

      {/* Properties */}
      <group position={[4, 2.5, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.15} color="#888" anchorX="left">
          c = 3×10⁸ m/s
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#888" anchorX="left">
          E ⊥ B ⊥ direction
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#888" anchorX="left">
          c = λf
        </Text>
      </group>

      {/* Wavelength indicator */}
      <group position={[0, -2, 0]}>
        <Line points={[[-1, 0, 0], [1, 0, 0]]} color="#F59E0B" lineWidth={2} />
        <mesh position={[-1, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[1, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#F59E0B">
          λ (wavelength)
        </Text>
      </group>

      {/* Spectrum note */}
      <Text position={[0, -3, 0]} fontSize={0.15} color="#666">
        Radio | Microwave | IR | Visible | UV | X-ray | Gamma
      </Text>
    </group>
  );
};

export default EMWaveSimulation;
