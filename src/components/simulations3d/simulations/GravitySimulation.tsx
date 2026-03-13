import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Trail, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface FallingObject {
  id: string;
  planet: string;
  gravity: number;
  position: THREE.Vector3;
  velocity: number;
  color: string;
  groundY: number;
  bounced: boolean;
  size: number;
}

export const GravitySimulation = () => {
  const [objects, setObjects] = useState<FallingObject[]>([
    { id: 'earth', planet: 'Earth', gravity: 9.8, position: new THREE.Vector3(-4, 6, 0), velocity: 0, color: '#4A90D9', groundY: -2, bounced: false, size: 0.4 },
    { id: 'moon', planet: 'Moon', gravity: 1.62, position: new THREE.Vector3(0, 6, 0), velocity: 0, color: '#B5B5B5', groundY: -2, bounced: false, size: 0.2 },
    { id: 'jupiter', planet: 'Jupiter', gravity: 24.79, position: new THREE.Vector3(4, 6, 0), velocity: 0, color: '#D4A574', groundY: -2, bounced: false, size: 0.8 },
  ]);

  const objectRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    setObjects(prev => prev.map((obj, i) => {
      if (obj.position.y <= obj.groundY && obj.bounced) return obj;

      let newVelocity = obj.velocity + obj.gravity * delta;
      let newY = obj.position.y - newVelocity * delta;
      let bounced = obj.bounced;

      if (newY <= obj.groundY) {
        newY = obj.groundY;
        newVelocity = -newVelocity * 0.5;
        bounced = true;

        if (Math.abs(newVelocity) < 0.5) {
          newVelocity = 0;
        }
      }

      return {
        ...obj,
        velocity: newVelocity,
        position: new THREE.Vector3(obj.position.x, newY, obj.position.z),
        bounced,
      };
    }));

    // Update mesh positions
    objects.forEach((obj, i) => {
      if (objectRefs.current[i]) {
        objectRefs.current[i]!.position.copy(obj.position);
      }
    });
  });

  // Reset simulation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        position: new THREE.Vector3(obj.position.x, 6, 0),
        velocity: 0,
        bounced: false,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* Falling objects with trails */}
      {objects.map((obj, i) => (
        <group key={obj.id}>
          {/* Rock/Sphere */}
          <Trail
            width={0.8}
            length={5}
            color={obj.color}
            attenuation={(t) => t * t}
          >
            <Sphere
              ref={(el) => { objectRefs.current[i] = el; }}
              args={[obj.size, 32, 32]}
              position={obj.position}
            >
              <meshStandardMaterial
                color={obj.color}
                metalness={0.3}
                roughness={0.6}
                emissive={obj.color}
                emissiveIntensity={0.1}
              />
            </Sphere>
          </Trail>

          {/* Impact Debris/Sparkles - Only visible when object has bounced/hit ground */}
          {obj.bounced && (
            <Sparkles
              count={20}
              scale={obj.size * 3}
              size={2}
              speed={0.5}
              color={obj.color}
              position={[obj.position.x, obj.groundY + 0.2, 0]}
            />
          )}

          {/* Planet label */}
          <Text
            position={[obj.position.x, 8, 0]}
            fontSize={0.4}
            color={obj.color}
            anchorX="center"
            anchorY="middle"
          >
            {obj.planet}
          </Text>

          {/* Gravity value */}
          <Text
            position={[obj.position.x, 7.3, 0]}
            fontSize={0.25}
            color="#888"
            anchorX="center"
            anchorY="middle"
          >
            {`g = ${obj.gravity} m/s²`}
          </Text>

          {/* Ground platform */}
          <mesh position={[obj.position.x, -2.1, 0]}>
            <boxGeometry args={[obj.size * 5, 0.2, obj.size * 5]} />
            <meshStandardMaterial color={obj.color} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={1}
          depthScale={1}
          color="#080808"
          metalness={0.5}
          mirror={0.3}
        />
      </mesh>

      {/* Height markers */}
      {[0, 2, 4, 6].map((y) => (
        <group key={y}>
          <Text
            position={[-7, y, 0]}
            fontSize={0.3}
            color="#555"
            anchorX="right"
          >
            {`${y}m`}
          </Text>
          <mesh position={[-6.5, y, 0]}>
            <boxGeometry args={[0.5, 0.02, 0.02]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default GravitySimulation;
