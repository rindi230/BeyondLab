import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export const ElectricCircuitSimulation = () => {
  const electronsRef = useRef<THREE.Points>(null);

  const electronCount = 50;
  const positions = useMemo(() => new Float32Array(electronCount * 3), []);
  const progress = useMemo(() => new Float32Array(electronCount), []);

  // Initialize electron positions along circuit
  useMemo(() => {
    for (let i = 0; i < electronCount; i++) {
      progress[i] = i / electronCount;
    }
  }, [progress]);

  // Circuit path points
  const getCircuitPosition = (t: number): [number, number, number] => {
    const totalLength = 16; // Total circuit perimeter
    const pos = (t * totalLength) % totalLength;
    
    // Bottom wire (left to right)
    if (pos < 4) {
      return [-2 + pos, -1.5, 0];
    }
    // Right wire (up)
    if (pos < 7) {
      return [2, -1.5 + (pos - 4), 0];
    }
    // Top wire (right to left through resistor)
    if (pos < 11) {
      return [2 - (pos - 7), 1.5, 0];
    }
    // Left wire (down)
    return [-2, 1.5 - (pos - 11), 0];
  };

  useFrame((_, delta) => {
    if (!electronsRef.current) return;

    for (let i = 0; i < electronCount; i++) {
      progress[i] = (progress[i] + delta * 0.15) % 1;
      const [x, y, z] = getCircuitPosition(progress[i]);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    electronsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Text position={[0, 4, 0]} fontSize={0.4} color="#888">
        Electric Circuit
      </Text>

      {/* Battery */}
      <group position={[-2, 0, 0]}>
        <Cylinder args={[0.3, 0.3, 2, 16]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </Cylinder>
        {/* Positive terminal */}
        <Cylinder args={[0.15, 0.15, 0.2, 16]} position={[0, 1.1, 0]}>
          <meshStandardMaterial color="#EF4444" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Text position={[0, 1.4, 0.3]} fontSize={0.2} color="#EF4444">+</Text>
        {/* Negative terminal */}
        <Cylinder args={[0.15, 0.15, 0.2, 16]} position={[0, -1.1, 0]}>
          <meshStandardMaterial color="#3B82F6" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Text position={[0, -1.4, 0.3]} fontSize={0.2} color="#3B82F6">−</Text>
        <Text position={[-0.8, 0, 0]} fontSize={0.2} color="#666">Battery</Text>
        <Text position={[-0.8, -0.3, 0]} fontSize={0.15} color="#888">9V</Text>
      </group>

      {/* Wires */}
      {/* Bottom wire */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right wire */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Top wire (split for resistor) */}
      <mesh position={[-0.5, 1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Resistor */}
      <group position={[0.5, 1.5, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.35, 0.35]} />
          <meshStandardMaterial color="#D4A574" />
        </mesh>
        {/* Color bands */}
        <mesh position={[-0.35, 0, 0.18]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
        <mesh position={[-0.2, 0, 0.18]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <mesh position={[-0.05, 0, 0.18]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <mesh position={[0.2, 0, 0.18]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.2} color="#666">1kΩ</Text>
      </group>

      {/* Light bulb */}
      <group position={[2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color="#FFFF00" 
            emissive="#FFFF00" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
        <pointLight intensity={5} color="#FFFF00" distance={3} />
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
          <meshStandardMaterial color="#666" metalness={0.8} />
        </mesh>
        <Text position={[0.6, 0, 0]} fontSize={0.2} color="#666">Bulb</Text>
      </group>

      {/* Electrons */}
      <points ref={electronsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={electronCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#00BFFF" />
      </points>

      {/* Current direction arrow */}
      <group position={[0, -1.8, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#22C55E">
          Current (I)
        </Text>
      </group>

      {/* Formula */}
      <group position={[4, 1, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.25} color="#888" anchorX="left">
          Ohm's Law:
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#666" anchorX="left">
          V = IR
        </Text>
        <Text position={[0, -0.8, 0]} fontSize={0.15} color="#666" anchorX="left">
          I = 9V / 1000Ω = 9mA
        </Text>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default ElectricCircuitSimulation;
