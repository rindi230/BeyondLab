import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WaveSimulation = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  const { width, height, widthSegments, heightSegments } = useMemo(() => ({
    width: 20,
    height: 20,
    widthSegments: 100,
    heightSegments: 100,
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;
    
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      // Create interference pattern from two wave sources
      const distance1 = Math.sqrt((x + 5) ** 2 + y ** 2);
      const distance2 = Math.sqrt((x - 5) ** 2 + y ** 2);
      
      const wave1 = Math.sin(distance1 * 0.8 - time * 3) * 0.5;
      const wave2 = Math.sin(distance2 * 0.8 - time * 3) * 0.5;
      
      positions[i + 2] = wave1 + wave2;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      {/* Wave surface */}
      <mesh ref={meshRef}>
        <planeGeometry 
          ref={geometryRef}
          args={[width, height, widthSegments, heightSegments]} 
        />
        <meshStandardMaterial 
          color="#0077BE"
          metalness={0.8}
          roughness={0.2}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      {/* Wave sources */}
      <WaveSource position={[-5, 0, 0]} />
      <WaveSource position={[5, 0, 0]} />
      
      {/* Grid underneath for reference */}
      <gridHelper args={[20, 20, '#333', '#222']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />
    </group>
  );
};

const WaveSource = ({ position }: { position: [number, number, number] }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });
  
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00FFFF" 
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <pointLight intensity={3} color="#00FFFF" distance={5} />
    </group>
  );
};

export default WaveSimulation;
