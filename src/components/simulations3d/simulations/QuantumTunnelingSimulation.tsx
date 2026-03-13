import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export const QuantumTunnelingSimulation = () => {
  const waveRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const tunnelParticleRef = useRef<THREE.Mesh>(null);

  // Wave function geometry
  const wavePoints = useMemo(() => {
    const points: number[] = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 16 - 8;
      points.push(x);
      points.push(0);
      points.push(0);
    }

    return new Float32Array(points);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (waveRef.current) {
      const positions = waveRef.current.geometry.attributes.position.array as Float32Array;
      const barrierLeft = 0;
      const barrierRight = 2;

      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * 16 - 8;
        let y = 0;

        if (x < barrierLeft) {
          // Incident + reflected wave
          const incident = Math.sin(x * 2 - time * 3) * Math.exp(-Math.pow(x + 4 - time * 0.5, 2) * 0.1);
          const reflected = Math.sin(-x * 2 - time * 3) * 0.3 * Math.exp(-Math.pow(x + 4 - time * 0.5, 2) * 0.1);
          y = incident + reflected;
        } else if (x <= barrierRight) {
          // Exponential decay inside barrier
          const decay = Math.exp(-(x - barrierLeft) * 2);
          y = Math.sin(x * 2 - time * 3) * decay * 0.5;
        } else {
          // Transmitted wave (smaller amplitude)
          const transmitted = Math.sin(x * 2 - time * 3) * 0.3 * Math.exp(-Math.pow(x - 4 - time * 0.5, 2) * 0.1);
          y = transmitted;
        }

        positions[i * 3 + 1] = y;
      }

      waveRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate particle
    if (particleRef.current) {
      const x = -4 + (time % 4) * 2;
      if (x < 0) {
        particleRef.current.position.x = x;
        particleRef.current.visible = true;
      } else {
        particleRef.current.visible = false;
      }
    }

    // Tunneled particle (appears on other side)
    if (tunnelParticleRef.current) {
      const x = 2 + ((time + 0.5) % 4) * 2;
      if (x > 2 && x < 8) {
        tunnelParticleRef.current.position.x = x;
        tunnelParticleRef.current.visible = true;
        (tunnelParticleRef.current.material as THREE.MeshStandardMaterial).opacity = 0.3;
      } else {
        tunnelParticleRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      <Text position={[0, 4, 0]} fontSize={0.4} color="#888">
        Quantum Tunneling
      </Text>

      {/* Potential barrier */}
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#8B5CF6" transparent opacity={0.5} />
      </mesh>
      <Text position={[1, 2, 0]} fontSize={0.2} color="#8B5CF6">
        Potential Barrier
      </Text>

      {/* Wave function */}
      <mesh ref={waveRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={201}
            array={wavePoints}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00FFFF" linewidth={2} />
      </mesh>
      <Line
        points={Array.from({ length: 201 }, (_, i) => [
          (i / 200) * 16 - 8,
          0,
          0
        ])}
        color="#00FFFF"
        lineWidth={2}
      />

      {/* Particle visualization */}
      <mesh ref={particleRef} position={[-4, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight position={[-4, 0, 0]} intensity={3} color="#00FFFF" distance={2} />

      {/* Tunneled particle (dimmer) */}
      <mesh ref={tunnelParticleRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Energy levels */}
      <Line
        points={[[-8, 1, 0], [0, 1, 0]]}
        color="#F59E0B"
        lineWidth={2}
        dashed
      />
      <Text position={[-6, 1.3, 0]} fontSize={0.15} color="#F59E0B">
        Particle Energy E
      </Text>

      <Line
        points={[[0, 2, 0], [2, 2, 0]]}
        color="#EF4444"
        lineWidth={2}
        dashed
      />
      <Text position={[1, 2.3, 0]} fontSize={0.15} color="#EF4444">
        Barrier V₀
      </Text>

      {/* Probability labels */}
      <group position={[-5, -2, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.2} color="#888">
          |ψ|² High
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#666">
          (Incident wave)
        </Text>
      </group>

      <group position={[5, -2, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.2} color="#888">
          |ψ|² Low
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#666">
          (Transmitted)
        </Text>
      </group>

      {/* Formula */}
      <Text position={[0, -3, 0]} fontSize={0.2} color="#666">
        T ∝ exp(-2κL) where κ = √(2m(V₀-E))/ħ
      </Text>

      {/* Classical forbidden region indicator */}
      <mesh position={[1, -1.5, 0]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.3} />
      </mesh>
      <Text position={[1, -1.5, 0]} fontSize={0.12} color="#EF4444">
        Classically Forbidden
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default QuantumTunnelingSimulation;
