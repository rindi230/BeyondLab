import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const PhaseChangeSimulation = () => {
  const [phase, setPhase] = useState<'solid' | 'melting' | 'liquid' | 'boiling' | 'gas'>('solid');
  const particlesRef = useRef<THREE.Points>(null);
  const temperatureRef = useRef(0);

  // Particle positions
  const particleCount = 200;
  const positions = useMemo(() => new Float32Array(particleCount * 3), []);
  const velocities = useMemo(() => {
    const v = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      v[i * 3] = (Math.random() - 0.5) * 0.02;
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return v;
  }, []);

  // Initialize solid lattice
  useEffect(() => {
    const gridSize = Math.ceil(Math.cbrt(particleCount));
    let idx = 0;
    for (let x = 0; x < gridSize && idx < particleCount; x++) {
      for (let y = 0; y < gridSize && idx < particleCount; y++) {
        for (let z = 0; z < gridSize && idx < particleCount; z++) {
          positions[idx * 3] = (x - gridSize / 2) * 0.4;
          positions[idx * 3 + 1] = (y - gridSize / 2) * 0.4;
          positions[idx * 3 + 2] = (z - gridSize / 2) * 0.4;
          idx++;
        }
      }
    }
  }, [positions]);

  // Cycle through phases
  useEffect(() => {
    const phases: typeof phase[] = ['solid', 'melting', 'liquid', 'boiling', 'gas'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;

    // Update temperature display
    const temps = { solid: -20, melting: 0, liquid: 50, boiling: 100, gas: 150 };
    temperatureRef.current = temps[phase];

    // Different behavior per phase
    const vibration = { solid: 0.01, melting: 0.03, liquid: 0.05, boiling: 0.08, gas: 0.15 };
    const spread = { solid: 0, melting: 0.002, liquid: 0.01, boiling: 0.02, gas: 0.05 };

    for (let i = 0; i < particleCount; i++) {
      // Add vibration
      pos[i * 3] += (Math.random() - 0.5) * vibration[phase];
      pos[i * 3 + 1] += (Math.random() - 0.5) * vibration[phase];
      pos[i * 3 + 2] += (Math.random() - 0.5) * vibration[phase];

      // Spread out for higher phases
      if (phase !== 'solid') {
        pos[i * 3] += velocities[i * 3] * spread[phase] * 10;
        pos[i * 3 + 1] += velocities[i * 3 + 1] * spread[phase] * 10;
        pos[i * 3 + 2] += velocities[i * 3 + 2] * spread[phase] * 10;

        // Gas rises
        if (phase === 'gas' || phase === 'boiling') {
          pos[i * 3 + 1] += 0.01;
          if (pos[i * 3 + 1] > 4) {
            pos[i * 3 + 1] = -2;
          }
        }

        // Boundary
        const bound = phase === 'gas' ? 4 : 2;
        if (Math.abs(pos[i * 3]) > bound) velocities[i * 3] *= -1;
        if (Math.abs(pos[i * 3 + 2]) > bound) velocities[i * 3 + 2] *= -1;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const getColor = () => {
    switch (phase) {
      case 'solid': return '#88CCFF';
      case 'melting': return '#66BBFF';
      case 'liquid': return '#3B82F6';
      case 'boiling': return '#EF4444';
      case 'gas': return '#F59E0B';
    }
  };

  return (
    <group>
      <Text position={[0, 4.5, 0]} fontSize={0.4} color="#888">
        Phase Changes of Matter
      </Text>

      {/* Temperature indicator */}
      <group position={[-4, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 6, 0.3]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, -2.5 + (temperatureRef.current + 50) * 0.03, 0]}>
          <boxGeometry args={[0.25, 0.5 + (temperatureRef.current + 50) * 0.03, 0.25]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0.5, 2.5, 0]} fontSize={0.2} color="#888">100°C</Text>
        <Text position={[0.5, 0, 0]} fontSize={0.2} color="#888">0°C</Text>
        <Text position={[0.5, -2.5, 0]} fontSize={0.2} color="#888">-50°C</Text>
      </group>

      {/* Container */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshStandardMaterial color="#4B5563" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Particles */}
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
          size={0.15} 
          color={getColor()} 
          transparent 
          opacity={phase === 'gas' ? 0.6 : 0.9}
        />
      </points>

      {/* Phase label */}
      <Text position={[0, -3, 0]} fontSize={0.4} color={getColor()}>
        {phase.charAt(0).toUpperCase() + phase.slice(1)}
      </Text>

      {/* Heat source for boiling */}
      {(phase === 'boiling' || phase === 'gas') && (
        <mesh position={[0, -2.5, 0]}>
          <boxGeometry args={[4, 0.3, 4]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default PhaseChangeSimulation;
