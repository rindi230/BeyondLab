import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

export const GalaxySimulation = () => {
  const galaxyRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const starCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // Spiral arm distribution
      const arm = Math.floor(Math.random() * 4);
      const armAngle = (arm / 4) * Math.PI * 2;
      
      const distance = 0.5 + Math.random() * 5;
      const spiralAngle = distance * 0.8 + armAngle;
      const spread = (0.2 + distance * 0.1) * (Math.random() - 0.5);
      
      pos[i * 3] = Math.cos(spiralAngle) * distance + spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3 * (1 - distance / 6);
      pos[i * 3 + 2] = Math.sin(spiralAngle) * distance + spread;
      
      // Color based on distance (blue core, yellow arms, red outer)
      if (distance < 1) {
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1;
      } else if (distance < 3) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0.8;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.5;
      }
    }
    
    return { positions: pos, colors };
  }, []);

  useFrame((_, delta) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      <Text position={[0, 6, 0]} fontSize={0.4} color="#888">
        Spiral Galaxy
      </Text>

      <group ref={galaxyRef} rotation={[Math.PI / 5, 0, 0]}>
        {/* Galactic core */}
        <Sphere ref={coreRef} args={[0.8, 32, 32]}>
          <meshStandardMaterial 
            color="#FFFACD"
            emissive="#FDB813"
            emissiveIntensity={1}
          />
        </Sphere>
        <pointLight intensity={50} color="#FDB813" distance={10} />
        
        {/* Core glow */}
        <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial 
            color="#FDB813"
            transparent
            opacity={0.2}
          />
        </Sphere>

        {/* Stars */}
        <points ref={starsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={starCount}
              array={positions.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={starCount}
              array={positions.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.05} 
            vertexColors
            transparent 
            opacity={0.9}
            sizeAttenuation
          />
        </points>

        {/* Spiral arm dust lanes */}
        {[0, 1, 2, 3].map((arm) => (
          <mesh 
            key={arm} 
            rotation={[0, (arm / 4) * Math.PI * 2, 0]}
            position={[0, 0.02, 0]}
          >
            <ringGeometry args={[1, 5, 32, 1, 0, Math.PI / 3]} />
            <meshBasicMaterial 
              color="#4a3728" 
              transparent 
              opacity={0.1} 
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Central black hole indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Info labels */}
      <group position={[6, 2, 0]}>
        <Text position={[0, 1, 0]} fontSize={0.2} color="#888" anchorX="left">
          Structure:
        </Text>
        <Text position={[0, 0.6, 0]} fontSize={0.15} color="#FFFACD" anchorX="left">
          • Bright core (old stars)
        </Text>
        <Text position={[0, 0.3, 0]} fontSize={0.15} color="#FFD700" anchorX="left">
          • Spiral arms (young stars)
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.15} color="#FF8C00" anchorX="left">
          • Outer halo (red giants)
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#666" anchorX="left">
          • Dark matter halo
        </Text>
        <Text position={[0, -0.8, 0]} fontSize={0.15} color="#888" anchorX="left">
          ~200 billion stars
        </Text>
      </group>

      {/* Scale indicator */}
      <group position={[0, -4, 0]}>
        <mesh>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshBasicMaterial color="#666" />
        </mesh>
        <Text position={[0, -0.3, 0]} fontSize={0.2} color="#666">
          ~100,000 light-years
        </Text>
      </group>

      {/* Rotation direction */}
      <group position={[-5, 0, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.2} color="#888">
          Rotation ↺
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.15} color="#666">
          ~230 million years/orbit
        </Text>
      </group>
    </group>
  );
};

export default GalaxySimulation;
