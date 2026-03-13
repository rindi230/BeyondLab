import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';

export const CentripetalSimulation = () => {
  const ballRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(0);
  const radius = 3;
  const angularVelocity = 2;

  useFrame((_, delta) => {
    angleRef.current += angularVelocity * delta;

    if (ballRef.current) {
      ballRef.current.position.x = Math.cos(angleRef.current) * radius;
      ballRef.current.position.z = Math.sin(angleRef.current) * radius;
    }
  });

  // Calculate centripetal acceleration
  const velocity = angularVelocity * radius;
  const centripetalAccel = (velocity * velocity) / radius;

  return (
    <group>
      {/* Center pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Circular path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* String/rope */}
      <Line
        points={[
          [0, 0, 0],
          [Math.cos(angleRef.current) * radius, 0, Math.sin(angleRef.current) * radius],
        ]}
        color="#A88B5A"
        lineWidth={2}
      />

      {/* Rotating ball with trail */}
      <Trail width={0.5} length={8} color="#3B82F6" attenuation={(t) => t * t}>
        <mesh ref={ballRef} position={[radius, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color="#3B82F6" 
            metalness={0.4} 
            roughness={0.3}
            emissive="#3B82F6"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Trail>

      {/* Force vectors (update position in render) */}
      <ForceVectors angleRef={angleRef} radius={radius} />

      {/* Labels */}
      <Text position={[0, 3, 0]} fontSize={0.35} color="#888">
        Centripetal Force
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#666">
        Fc = mv²/r = ma_c
      </Text>
      <Text position={[0, 2, 0]} fontSize={0.2} color="#666">
        v = {velocity.toFixed(1)} m/s | a_c = {centripetalAccel.toFixed(1)} m/s²
      </Text>

      {/* Velocity direction indicator */}
      <Text position={[4, 0, 0]} fontSize={0.2} color="#22C55E">
        v (tangent)
      </Text>
      <Text position={[0, 0, 4]} fontSize={0.2} color="#EF4444">
        F_c (toward center)
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

const ForceVectors = ({ angleRef, radius }: { angleRef: React.MutableRefObject<number>; radius: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const x = Math.cos(angleRef.current) * radius;
      const z = Math.sin(angleRef.current) * radius;
      groupRef.current.position.set(x, 0, z);
      groupRef.current.rotation.y = -angleRef.current + Math.PI / 2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Centripetal force (toward center) */}
      <Line points={[[0, 0, 0], [-1.5, 0, 0]]} color="#EF4444" lineWidth={3} />
      <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>

      {/* Velocity (tangent) */}
      <Line points={[[0, 0, 0], [0, 0, 1.2]]} color="#22C55E" lineWidth={3} />
      <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#22C55E" />
      </mesh>
    </group>
  );
};

export default CentripetalSimulation;
