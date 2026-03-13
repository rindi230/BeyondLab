import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

export const AtomicModelSimulation = () => {
  const electronRefs = useRef<THREE.Group[]>([]);
  const nucleusRef = useRef<THREE.Group>(null);

  // Electron shell configuration
  const shells = useMemo(() => [
    { electrons: 2, radius: 2, speed: 2, color: '#00FFFF' },
    { electrons: 8, radius: 3.5, speed: 1.5, color: '#00FF00' },
    { electrons: 6, radius: 5, speed: 1, color: '#FFFF00' },
  ], []);

  // Create nucleus particles (protons and neutrons)
  const nucleusParticles = useMemo(() => {
    const particles: Array<{ position: THREE.Vector3; type: 'proton' | 'neutron' }> = [];
    const count = 16;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 0.6;

      particles.push({
        position: new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        ),
        type: i % 2 === 0 ? 'proton' : 'neutron',
      });
    }

    return particles;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Rotate nucleus slightly
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = time * 0.2;
      nucleusRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Nucleus */}
      <group ref={nucleusRef}>
        {nucleusParticles.map((particle, i) => (
          <Sphere key={i} args={[0.2, 32, 32]} position={particle.position}>
            <meshStandardMaterial
              color={particle.type === 'proton' ? '#FF4444' : '#4444FF'}
              emissive={particle.type === 'proton' ? '#FF4444' : '#4444FF'}
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.6}
            />
          </Sphere>
        ))}
        <pointLight intensity={5} color="#FF6666" distance={4} />
      </group>

      {/* Electron shells */}
      {shells.map((shell, shellIndex) => (
        <ElectronShell
          key={shellIndex}
          shell={shell}
          shellIndex={shellIndex}
        />
      ))}

      {/* Labels */}
      <Text position={[0, -7, 0]} fontSize={0.5} color="#888">
        Bohr Model - Electron Orbitals
      </Text>

      <Text position={[0, 0, 0]} fontSize={0.15} color="#FF4444">
        Nucleus
      </Text>
    </group>
  );
};

interface ElectronShellProps {
  shell: { electrons: number; radius: number; speed: number; color: string };
  shellIndex: number;
}

const ElectronShell = ({ shell, shellIndex }: ElectronShellProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const electronRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Rotate the entire shell
    if (groupRef.current) {
      groupRef.current.rotation.x = shellIndex * 0.4;
      groupRef.current.rotation.z = shellIndex * 0.3;
    }

    // Orbit electrons
    electronRefs.current.forEach((electron, i) => {
      if (electron) {
        const angle = time * shell.speed + (i * Math.PI * 2) / shell.electrons;
        electron.position.x = Math.cos(angle) * shell.radius;
        electron.position.z = Math.sin(angle) * shell.radius;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[shell.radius, 0.02, 8, 64]} />
        <meshBasicMaterial color={shell.color} transparent opacity={0.3} />
      </mesh>

      {/* Electrons */}
      {Array.from({ length: shell.electrons }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => { if (el) electronRefs.current[i] = el; }}
          args={[0.12, 16, 16]}
          position={[shell.radius, 0, 0]}
        >
          <meshStandardMaterial
            color={shell.color}
            emissive={shell.color}
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}

      {/* Shell label */}
      <Text
        position={[shell.radius + 0.5, 0, 0]}
        fontSize={0.2}
        color={shell.color}
      >
        {`n=${shellIndex + 1}`}
      </Text>
    </group>
  );
};

export default AtomicModelSimulation;
