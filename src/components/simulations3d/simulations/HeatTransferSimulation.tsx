import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const HeatTransferSimulation = () => {
  const conductionRef = useRef<THREE.Mesh>(null);
  const convectionRef = useRef<THREE.Points>(null);
  const radiationRef = useRef<THREE.Group>(null);

  // Convection particles
  const convectionParticles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 4 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Conduction - heat gradient visualization
    if (conductionRef.current) {
      const material = conductionRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = time;
      }
    }

    // Convection - particles rising and falling
    if (convectionRef.current) {
      const positions = convectionRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 100; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 2) {
          positions[i * 3 + 1] = -2;
          positions[i * 3] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
      }
      convectionRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Radiation - expanding waves
    if (radiationRef.current) {
      radiationRef.current.children.forEach((child, i) => {
        const scale = 1 + ((time * 0.5 + i * 0.3) % 2);
        child.scale.set(scale, scale, scale);
        (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: '#EF4444',
          transparent: true,
          opacity: 0.5 - (scale - 1) * 0.25,
        });
      });
    }
  });

  return (
    <group>
      <Text position={[0, 5, 0]} fontSize={0.4} color="#888">
        Heat Transfer Methods
      </Text>

      {/* CONDUCTION - metal bar */}
      <group position={[-5, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#F59E0B">
          Conduction
        </Text>
        
        {/* Hot end */}
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Metal bar with gradient */}
        <mesh position={[0, 0, 0]} ref={conductionRef}>
          <boxGeometry args={[2, 0.5, 0.5]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Cold end */}
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
        
        <Text position={[0, -1.5, 0]} fontSize={0.15} color="#666">
          Q = -kA(dT/dx)
        </Text>
      </group>

      {/* CONVECTION - fluid currents */}
      <group position={[0, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#F59E0B">
          Convection
        </Text>
        
        {/* Container */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 4, 2.5]} />
          <meshStandardMaterial color="#3B82F6" transparent opacity={0.2} />
        </mesh>
        
        {/* Heat source */}
        <mesh position={[0, -2.2, 0]}>
          <boxGeometry args={[2.5, 0.3, 2.5]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Rising particles */}
        <points ref={convectionRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={convectionParticles}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#F59E0B" />
        </points>
        
        <Text position={[0, -3, 0]} fontSize={0.15} color="#666">
          Q = hA(T_s - T_∞)
        </Text>
      </group>

      {/* RADIATION - electromagnetic waves */}
      <group position={[5, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#F59E0B">
          Radiation
        </Text>
        
        {/* Heat source */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color="#EF4444" 
            emissive="#EF4444" 
            emissiveIntensity={1}
          />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={5} color="#EF4444" distance={5} />
        
        {/* Radiation waves */}
        <group ref={radiationRef}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, 0]}>
              <ringGeometry args={[0.8, 0.85, 32]} />
              <meshBasicMaterial color="#EF4444" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        
        <Text position={[0, -2, 0]} fontSize={0.15} color="#666">
          Q = εσAT⁴
        </Text>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default HeatTransferSimulation;
