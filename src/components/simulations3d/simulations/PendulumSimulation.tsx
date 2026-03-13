import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PendulumSimulationProps {
  gravity?: number;
  length?: number;
  damping?: number;
}

export const PendulumSimulation = ({
  gravity = 9.8,
  length = 4,
  damping = 0.995
}: PendulumSimulationProps) => {
  const pendulumRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.PI / 3);
  const velocityRef = useRef(0);

  useFrame((_, delta) => {
    if (!pendulumRef.current) return;

    // Simple pendulum physics
    const acceleration = (-gravity / length) * Math.sin(angleRef.current);
    velocityRef.current += acceleration * delta;
    velocityRef.current *= damping;
    angleRef.current += velocityRef.current * delta;

    pendulumRef.current.rotation.z = angleRef.current;
  });

  return (
    <group>
      {/* Pivot point */}
      <Sphere args={[0.2, 32, 32]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </Sphere>

      {/* Pendulum arm and bob */}
      <group ref={pendulumRef} position={[0, 5, 0]}>
        {/* Rod */}
        <Cylinder args={[0.05, 0.05, length, 16]} position={[0, -length / 2, 0]}>
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </Cylinder>

        {/* Bob */}
        <Sphere args={[0.5, 32, 32]} position={[0, -length, 0]}>
          <meshStandardMaterial
            color="#D946EF"
            metalness={0.3}
            roughness={0.4}
            emissive="#D946EF"
            emissiveIntensity={0.2}
          />
        </Sphere>

        {/* Trail glow */}
        <pointLight position={[0, -length, 0]} intensity={2} color="#D946EF" distance={3} />
      </group>
    </group>
  );
};

export default PendulumSimulation;
