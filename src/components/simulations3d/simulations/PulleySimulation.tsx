import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export const PulleySimulation = () => {
  const mass1Ref = useRef<THREE.Mesh>(null);
  const mass2Ref = useRef<THREE.Mesh>(null);
  const pulleyRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);

  const m1 = 3; // heavier mass
  const m2 = 2; // lighter mass
  const g = 9.8;
  // Atwood machine: a = (m1 - m2) / (m1 + m2) * g
  const acceleration = ((m1 - m2) / (m1 + m2)) * g;

  useEffect(() => {
    const interval = setInterval(() => {
      positionRef.current = 0;
      velocityRef.current = 0;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (positionRef.current >= 3) return;

    velocityRef.current += acceleration * delta;
    positionRef.current += velocityRef.current * delta;

    if (mass1Ref.current && mass2Ref.current && pulleyRef.current) {
      mass1Ref.current.position.y = 0 - positionRef.current;
      mass2Ref.current.position.y = -2 + positionRef.current;
      pulleyRef.current.rotation.z -= velocityRef.current * delta * 0.5;
    }
  });

  return (
    <group>
      {/* Support structure */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[4, 0.3, 0.5]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-1.5, 2, 0]}>
        <boxGeometry args={[0.2, 4, 0.2]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.5, 2, 0]}>
        <boxGeometry args={[0.2, 4, 0.2]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Pulley wheel */}
      <group position={[0, 3.5, 0]}>
        <Cylinder ref={pulleyRef} args={[0.5, 0.5, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.1, 0.1, 0.4, 16]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </Cylinder>
      </group>

      {/* Rope */}
      <mesh position={[-0.5, 1.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3.5, 8]} />
        <meshStandardMaterial color="#A88B5A" />
      </mesh>
      <mesh position={[0.5, 0.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 5.5, 8]} />
        <meshStandardMaterial color="#A88B5A" />
      </mesh>

      {/* Mass 1 (heavier) */}
      <mesh ref={mass1Ref} position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#EF4444" metalness={0.3} roughness={0.5} />
      </mesh>
      <Text position={[-0.5, 0, 0.5]} fontSize={0.25} color="white">
        {m1}kg
      </Text>

      {/* Mass 2 (lighter) */}
      <mesh ref={mass2Ref} position={[0.5, -2, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.3} roughness={0.5} />
      </mesh>
      <Text position={[0.5, -2, 0.4]} fontSize={0.2} color="white">
        {m2}kg
      </Text>

      {/* Formula display */}
      <Text position={[4, 3, 0]} fontSize={0.25} color="#888" anchorX="left">
        Atwood Machine
      </Text>
      <Text position={[4, 2.5, 0]} fontSize={0.2} color="#666" anchorX="left">
        a = (m₁ - m₂)/(m₁ + m₂) × g
      </Text>
      <Text position={[4, 2, 0]} fontSize={0.2} color="#666" anchorX="left">
        a = {acceleration.toFixed(2)} m/s²
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default PulleySimulation;
