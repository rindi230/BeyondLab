
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingObject {
  name: string;
  density: number;
  color: string;
  size: number;
  shape: 'sphere' | 'box';
}

export const BuoyancySimulation = () => {
  const objectsRef = useRef<THREE.Group>(null);
  const waterDensity = 1000; // kg/m³

  const objects: FloatingObject[] = [
    { name: 'Wood', density: 600, color: '#8B4513', size: 0.5, shape: 'box' },
    { name: 'Ice', density: 920, color: '#ADD8E6', size: 0.4, shape: 'box' },
    { name: 'Ball', density: 500, color: '#EF4444', size: 0.35, shape: 'sphere' },
    { name: 'Iron', density: 7800, color: '#666', size: 0.3, shape: 'sphere' },
    { name: 'Cork', density: 200, color: '#D2691E', size: 0.25, shape: 'sphere' },
  ];

  const [positions, setPositions] = useState<number[]>(objects.map(() => 2));
  const velocities = useRef<number[]>(objects.map(() => 0));

  useFrame((_, delta) => {
    const newPositions = [...positions];
    
    objects.forEach((obj, i) => {
      const waterLevel = 0;
      const submergedDepth = Math.max(0, waterLevel - (newPositions[i] - obj.size));
      const submergedFraction = Math.min(1, submergedDepth / (obj.size * 2));
      
      // Buoyant force
      const volume = obj.shape === 'sphere' 
        ? (4/3) * Math.PI * Math.pow(obj.size, 3)
        : Math.pow(obj.size * 2, 3);
      const buoyantForce = waterDensity * 9.8 * volume * submergedFraction;
      
      // Weight
      const weight = obj.density * volume * 9.8;
      
      // Net force and acceleration
      const netForce = buoyantForce - weight;
      const mass = obj.density * volume;
      const acceleration = netForce / mass;
      
      // Apply damping in water
      const damping = submergedFraction > 0 ? 0.95 : 0.99;
      velocities.current[i] += acceleration * delta;
      velocities.current[i] *= damping;
      newPositions[i] += velocities.current[i] * delta;
      
      // Floor collision
      if (newPositions[i] < -2 + obj.size) {
        newPositions[i] = -2 + obj.size;
        velocities.current[i] = 0;
      }
    });
    
    setPositions(newPositions);
  });

  return (
    <group>
      <Text position={[0, 4, 0]} fontSize={0.4} color="#888">
        Buoyancy - Archimedes' Principle
      </Text>

      {/* Water container */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial color="#0077BE" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Water surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#0077BE" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Water level indicator */}
      <Text position={[4.5, 0, 0]} fontSize={0.2} color="#0077BE">
        Water Level
      </Text>

      {/* Floating objects */}
      <group ref={objectsRef}>
        {objects.map((obj, i) => {
          const xPos = (i - 2) * 1.5;
          return (
            <group key={obj.name} position={[xPos, positions[i], 0]}>
              {obj.shape === 'sphere' ? (
                <Sphere args={[obj.size, 32, 32]}>
                  <meshStandardMaterial color={obj.color} metalness={0.3} roughness={0.5} />
                </Sphere>
              ) : (
                <Box args={[obj.size * 2, obj.size * 2, obj.size * 2]}>
                  <meshStandardMaterial color={obj.color} metalness={0.2} roughness={0.6} />
                </Box>
              )}
              <Text position={[0, obj.size + 0.3, 0]} fontSize={0.15} color="#888">
                {obj.name}
              </Text>
              <Text position={[0, obj.size + 0.1, 0]} fontSize={0.1} color="#666">
                ρ={obj.density}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Force arrows for one object */}
      <group position={[0, positions[2], 2]}>
        {/* Buoyant force (up) */}
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
        <Text position={[0.3, 0.5, 0]} fontSize={0.12} color="#22C55E">Fb</Text>

        {/* Weight (down) */}
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <Text position={[0.3, -0.5, 0]} fontSize={0.12} color="#EF4444">W</Text>
      </group>

      {/* Formula */}
      <group position={[0, -3.5, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.25} color="#888">
          Fb = ρ_water × V_submerged × g
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#666">
          Object floats if ρ_object {'<'} ρ_water (1000 kg/m³)
        </Text>
      </group>

      {/* Tank edges */}
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[8.1, 0.1, 4.1]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
};

export default BuoyancySimulation;
