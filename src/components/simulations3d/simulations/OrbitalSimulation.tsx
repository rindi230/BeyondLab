import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface Planet {
  name: string;
  distance: number;
  size: number;
  color: string;
  speed: number;
  emissive?: string;
}

export const OrbitalSimulation = () => {
  const planets: Planet[] = useMemo(() => [
    { name: 'Mercury', distance: 2, size: 0.15, color: '#B5B5B5', speed: 4.7 },
    { name: 'Venus', distance: 3, size: 0.25, color: '#E6C87A', speed: 3.5 },
    { name: 'Earth', distance: 4, size: 0.3, color: '#4A90D9', speed: 3.0 },
    { name: 'Mars', distance: 5.5, size: 0.2, color: '#D9534F', speed: 2.4 },
    { name: 'Jupiter', distance: 8, size: 0.8, color: '#D4A574', speed: 1.3 },
    { name: 'Saturn', distance: 11, size: 0.7, color: '#F4D58D', speed: 0.9 },
  ], []);

  return (
    <group>
      {/* Sun */}
      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#FDB813"
          emissive="#FDB813"
          emissiveIntensity={2}
        />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={100} color="#FDB813" distance={50} />

      {/* Planets */}
      {planets.map((planet, i) => (
        <PlanetOrbit key={planet.name} planet={planet} index={i} />
      ))}
    </group>
  );
};

interface PlanetOrbitProps {
  planet: Planet;
  index: number;
}

const PlanetOrbit = ({ planet, index }: PlanetOrbitProps) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(index * (Math.PI * 2 / 6));

  useFrame((_, delta) => {
    angleRef.current += delta * planet.speed * 0.1;
    const x = Math.cos(angleRef.current) * planet.distance;
    const z = Math.sin(angleRef.current) * planet.distance;

    if (planetRef.current) {
      planetRef.current.position.x = x;
      planetRef.current.position.z = z;
      planetRef.current.rotation.y += delta;
    }

    // Update ring position to match planet
    if (ringRef.current) {
      ringRef.current.position.x = x;
      ringRef.current.position.z = z;
    }
  });

  return (
    <group>
      {/* Orbit ring */}
      <Ring args={[planet.distance - 0.02, planet.distance + 0.02, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#333" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>

      {/* Planet with trail */}
      <Trail
        width={planet.size * 2}
        length={6}
        color={planet.color}
        attenuation={(t) => t * t}
      >
        <Sphere ref={planetRef} args={[planet.size, 32, 32]} position={[planet.distance, 0, 0]}>
          <meshStandardMaterial
            color={planet.color}
            metalness={0.2}
            roughness={0.8}
          />
        </Sphere>
      </Trail>

      {/* Saturn's rings */}
      {planet.name === 'Saturn' && (
        <Ring
          ref={ringRef}
          args={[planet.size * 1.3, planet.size * 2, 64]}
          position={[planet.distance, 0, 0]}
          rotation={[Math.PI / 2.5, 0, 0]}
        >
          <meshBasicMaterial color="#C9B896" transparent opacity={0.7} side={THREE.DoubleSide} />
        </Ring>
      )}
    </group>
  );
};

export default OrbitalSimulation;