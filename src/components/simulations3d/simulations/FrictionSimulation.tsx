import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const FrictionSimulation = () => {
  const blockRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(5);
  const positionRef = useRef(-5);
  const frictionCoeff = 0.3;
  const mass = 2;
  const gravity = 9.8;
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      velocityRef.current = 5;
      positionRef.current = -5;
      setStopped(false);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    if (stopped || !blockRef.current) return;

    const frictionForce = frictionCoeff * mass * gravity;
    const deceleration = frictionForce / mass;
    
    velocityRef.current -= deceleration * delta;
    
    if (velocityRef.current <= 0) {
      velocityRef.current = 0;
      setStopped(true);
    }
    
    positionRef.current += velocityRef.current * delta;
    blockRef.current.position.x = positionRef.current;
  });

  return (
    <group>
      {/* Sliding block */}
      <mesh ref={blockRef} position={[-5, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#EF4444"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Force arrows */}
      <group position={[positionRef.current, 0.5, 0]}>
        {/* Friction force arrow (backward) */}
        <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <Text position={[-1.5, 0.5, 0]} fontSize={0.2} color="#F59E0B">
          Friction
        </Text>
      </group>

      {/* Surface with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial 
          color="#8B7355"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Ground reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 8]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={20}
          roughness={1}
          color="#1a1a1a"
          metalness={0.5}
          mirror={0.2}
        />
      </mesh>

      {/* Coefficient label */}
      <Text position={[0, 3, 0]} fontSize={0.4} color="#888">
        μ = {frictionCoeff} (friction coefficient)
      </Text>

      {/* Distance markers */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.01, -3]}>
            <boxGeometry args={[0.05, 0.02, 0.3]} />
            <meshBasicMaterial color="#666" />
          </mesh>
          <Text position={[x, 0.3, -3]} fontSize={0.2} color="#666">
            {x + 5}m
          </Text>
        </group>
      ))}
    </group>
  );
};

export default FrictionSimulation;
