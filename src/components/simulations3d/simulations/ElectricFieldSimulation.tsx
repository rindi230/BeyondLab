import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const ElectricFieldSimulation = () => {
  const particlesRef = useRef<THREE.Group>(null);

  // Generate radial field lines from a point charge
  const fieldLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const numLines = 16;
    
    for (let i = 0; i < numLines; i++) {
      const theta = (i / numLines) * Math.PI * 2;
      for (let j = 0; j < 4; j++) {
        const phi = ((j + 1) / 5) * Math.PI;
        const points: THREE.Vector3[] = [];
        
        for (let r = 0.8; r <= 4; r += 0.2) {
          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.sin(theta);
          points.push(new THREE.Vector3(x, y, z));
        }
        lines.push(points);
      }
    }
    
    return lines;
  }, []);

  // Test charges that move along field lines
  const testCharges = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.2,
      offset: Math.random() * 3,
    }));
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.children.forEach((child, i) => {
        const charge = testCharges[i];
        const r = 1.5 + ((time * charge.speed + charge.offset) % 3);
        child.position.x = Math.cos(charge.angle) * r;
        child.position.z = Math.sin(charge.angle) * r;
        child.position.y = 0;
      });
    }
  });

  return (
    <group>
      {/* Central positive charge */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#EF4444" 
          metalness={0.5} 
          roughness={0.3}
          emissive="#EF4444"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text position={[0, 0, 0]} fontSize={0.5} color="white">+</Text>
      <pointLight position={[0, 0, 0]} intensity={5} color="#EF4444" distance={8} />

      {/* Electric field lines (radial) */}
      {fieldLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#F59E0B"
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}

      {/* Direction arrows */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((angle, i) => (
        <group key={i} position={[Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5]} rotation={[0, -angle, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.25, 8]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
        </group>
      ))}

      {/* Test charges (positive, repelled outward) */}
      <group ref={particlesRef}>
        {testCharges.map((_, i) => (
          <Sphere key={i} args={[0.15, 16, 16]}>
            <meshStandardMaterial 
              color="#22C55E" 
              emissive="#22C55E"
              emissiveIntensity={0.5}
            />
          </Sphere>
        ))}
      </group>

      {/* Equipotential circles */}
      {[1.5, 2.5, 3.5].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.02, r + 0.02, 64]} />
          <meshBasicMaterial color="#666" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[0, 4, 0]} fontSize={0.35} color="#888">
        Electric Field - Point Charge
      </Text>
      <Text position={[0, 3.5, 0]} fontSize={0.2} color="#666">
        E = kQ/r² (radial, away from +)
      </Text>
      <Text position={[4, 0, 0]} fontSize={0.2} color="#F59E0B">
        Field lines
      </Text>
      <Text position={[0, 0, 4]} fontSize={0.2} color="#666">
        Equipotential
      </Text>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default ElectricFieldSimulation;
