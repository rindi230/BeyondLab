import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export const LeverSimulation = () => {
  const leverRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);

  const mass1 = 4; // kg at distance 1.5m
  const mass2 = 2; // kg at distance 3m
  const d1 = 1.5;
  const d2 = 3;
  // Torque balance: m1 * d1 vs m2 * d2
  const torque1 = mass1 * d1;
  const torque2 = mass2 * d2;
  const netTorque = torque2 - torque1; // positive = right side heavier

  useFrame((_, delta) => {
    if (!leverRef.current) return;

    // Simple oscillation based on torque imbalance
    const targetAngle = netTorque * 0.05;
    velocityRef.current += (targetAngle - angleRef.current) * delta * 2;
    velocityRef.current *= 0.95; // damping
    angleRef.current += velocityRef.current * delta;

    leverRef.current.rotation.z = angleRef.current;
  });

  return (
    <group>
      {/* Fulcrum (triangle) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Lever beam */}
      <group ref={leverRef} position={[0, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[8, 0.2, 0.8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Mass 1 (left side) */}
        <mesh position={[-d1, 0.5, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#EF4444" metalness={0.3} roughness={0.5} />
        </mesh>
        <Text position={[-d1, 1.2, 0]} fontSize={0.25} color="#EF4444">
          {mass1}kg
        </Text>

        {/* Mass 2 (right side) */}
        <mesh position={[d2, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.3} roughness={0.5} />
        </mesh>
        <Text position={[d2, 1, 0]} fontSize={0.25} color="#3B82F6">
          {mass2}kg
        </Text>

        {/* Distance markers */}
        <mesh position={[-d1, -0.2, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshBasicMaterial color="#888" />
        </mesh>
        <mesh position={[d2, -0.2, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshBasicMaterial color="#888" />
        </mesh>
      </group>

      {/* Torque labels */}
      <Text position={[-3, -1.5, 0]} fontSize={0.2} color="#EF4444">
        τ₁ = {mass1}kg × {d1}m = {torque1}N·m
      </Text>
      <Text position={[3, -1.5, 0]} fontSize={0.2} color="#3B82F6">
        τ₂ = {mass2}kg × {d2}m = {torque2}N·m
      </Text>

      {/* Info */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#888">
        Lever: τ = F × d
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#666">
        {torque1 === torque2 ? 'Balanced!' : torque1 > torque2 ? 'Left side heavier' : 'Right side heavier'}
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default LeverSimulation;
