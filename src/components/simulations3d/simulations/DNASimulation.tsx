import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';

export const DNASimulation = () => {
  const helixRef = useRef<THREE.Group>(null);

  // Generate DNA helix structure
  const { backbone1, backbone2, basePairs } = useMemo(() => {
    const segments = 30;
    const height = 12;
    const radius = 1.5;
    const twists = 3;
    
    const backbone1: THREE.Vector3[] = [];
    const backbone2: THREE.Vector3[] = [];
    const basePairs: Array<{ p1: THREE.Vector3; p2: THREE.Vector3; color1: string; color2: string }> = [];
    
    const baseColors = [
      { color1: '#FF6B6B', color2: '#4ECDC4' }, // A-T
      { color1: '#4ECDC4', color2: '#FF6B6B' }, // T-A
      { color1: '#FFE66D', color2: '#95E1D3' }, // G-C
      { color1: '#95E1D3', color2: '#FFE66D' }, // C-G
    ];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = t * height - height / 2;
      const angle = t * Math.PI * 2 * twists;
      
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      
      backbone1.push(new THREE.Vector3(x1, y, z1));
      backbone2.push(new THREE.Vector3(x2, y, z2));
      
      if (i % 2 === 0 && i < segments) {
        const colorPair = baseColors[i % 4];
        basePairs.push({
          p1: new THREE.Vector3(x1, y, z1),
          p2: new THREE.Vector3(x2, y, z2),
          ...colorPair,
        });
      }
    }
    
    return { backbone1, backbone2, basePairs };
  }, []);

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={helixRef}>
      {/* Backbone strands */}
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(backbone1),
          100,
          0.15,
          8,
          false
        ]} />
        <meshStandardMaterial 
          color="#FF6B6B"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(backbone2),
          100,
          0.15,
          8,
          false
        ]} />
        <meshStandardMaterial 
          color="#4ECDC4"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      {/* Base pairs (rungs) */}
      {basePairs.map((pair, i) => (
        <BasePair key={i} {...pair} />
      ))}
      
      {/* Nucleotide spheres on backbone */}
      {backbone1.filter((_, i) => i % 3 === 0).map((pos, i) => (
        <Sphere key={`b1-${i}`} args={[0.2, 16, 16]} position={pos}>
          <meshStandardMaterial color="#FF6B6B" metalness={0.4} roughness={0.5} />
        </Sphere>
      ))}
      
      {backbone2.filter((_, i) => i % 3 === 0).map((pos, i) => (
        <Sphere key={`b2-${i}`} args={[0.2, 16, 16]} position={pos}>
          <meshStandardMaterial color="#4ECDC4" metalness={0.4} roughness={0.5} />
        </Sphere>
      ))}
      
      {/* Floating particles for ambiance */}
      <DNAParticles />
    </group>
  );
};

const BasePair = ({ p1, p2, color1, color2 }: { p1: THREE.Vector3; p2: THREE.Vector3; color1: string; color2: string }) => {
  const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const direction = new THREE.Vector3().subVectors(p2, p1);
  const length = direction.length();
  
  // Calculate rotation to align cylinder
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  return (
    <group>
      {/* Base 1 */}
      <Sphere args={[0.15, 16, 16]} position={p1.clone().lerp(midpoint, 0.3)}>
        <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.2} />
      </Sphere>
      
      {/* Base 2 */}
      <Sphere args={[0.15, 16, 16]} position={p2.clone().lerp(midpoint, 0.3)}>
        <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.2} />
      </Sphere>
      
      {/* Hydrogen bond line */}
      <Line
        points={[p1.clone().lerp(midpoint, 0.3), p2.clone().lerp(midpoint, 0.3)]}
        color="#666"
        lineWidth={2}
        dashed
        dashScale={3}
      />
    </group>
  );
};

const DNAParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorOptions = [
      [1, 0.42, 0.42],    // Red
      [0.31, 0.8, 0.77],  // Cyan
      [1, 0.9, 0.43],     // Yellow
      [0.58, 0.88, 0.83], // Light cyan
    ];
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      const y = (Math.random() - 0.5) * 16;
      
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    
    return { positions, colors };
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export default DNASimulation;
