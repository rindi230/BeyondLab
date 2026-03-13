import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export const InclinedPlaneSimulation = () => {
  const blockRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const angle = Math.PI / 6; // 30 degrees
  const gravity = 9.8;
  const friction = 0.2;
  const rampLength = 8;

  useEffect(() => {
    const interval = setInterval(() => {
      positionRef.current = 0;
      velocityRef.current = 0;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    if (!blockRef.current || positionRef.current >= rampLength) return;

    // a = g(sin θ - μ cos θ)
    const acceleration = gravity * (Math.sin(angle) - friction * Math.cos(angle));
    velocityRef.current += acceleration * delta;
    positionRef.current += velocityRef.current * delta;

    const x = -4 + positionRef.current * Math.cos(angle);
    const y = 4 - positionRef.current * Math.sin(angle);

    blockRef.current.position.set(x, y + 0.35, 0);
  });

  return (
    <group>
      {/* Inclined plane */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, -angle]}>
        <boxGeometry args={[10, 0.3, 3]} />
        <meshStandardMaterial color="#4B5563" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Sliding block */}
      <mesh ref={blockRef} position={[-4, 4.35, 0]} rotation={[0, 0, -angle]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Angle arc */}
      <Line
        points={[
          [4, -0.15, 0],
          [4.5, 0.1, 0],
          [4.8, 0.5, 0],
        ]}
        color="#F59E0B"
        lineWidth={2}
      />
      <Text position={[5.5, 0.5, 0]} fontSize={0.3} color="#F59E0B">
        θ = 30°
      </Text>

      {/* Force vectors on block */}
      <group position={[-2, 3, 0]}>
        {/* Weight */}
        <Line points={[[0, 0, 0], [0, -1, 0]]} color="#EF4444" lineWidth={3} />
        <mesh position={[0, -1.2, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <Text position={[0.4, -0.8, 0]} fontSize={0.2} color="#EF4444">mg</Text>

        {/* Normal force */}
        <Line points={[[0, 0, 0], [0.5, 0.87, 0]]} color="#22C55E" lineWidth={3} />
        <Text position={[0.8, 1.2, 0]} fontSize={0.2} color="#22C55E">N</Text>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* Support */}
      <mesh position={[4.5, -0.15, 0]}>
        <boxGeometry args={[0.5, 0.3, 3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Info */}
      <Text position={[0, 5, 0]} fontSize={0.35} color="#888">
        a = g(sin θ - μ cos θ) = {(gravity * (Math.sin(angle) - friction * Math.cos(angle))).toFixed(2)} m/s²
      </Text>
    </group>
  );
};

export default InclinedPlaneSimulation;
