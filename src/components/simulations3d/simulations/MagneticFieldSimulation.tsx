import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export const MagneticFieldSimulation = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const fieldLinesRef = useRef<THREE.Group>(null);

  // Generate field line points for a bar magnet
  const fieldLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const numLines = 12;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      
      // Create curved field lines from N to S pole
      for (let t = 0; t <= 1; t += 0.05) {
        const x = Math.cos(angle) * (1 + Math.sin(t * Math.PI) * 2);
        const y = (t - 0.5) * 6;
        const z = Math.sin(angle) * (1 + Math.sin(t * Math.PI) * 2);
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(points);
    }
    
    return lines;
  }, []);

  // Iron filing particles
  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3;
      const y = (Math.random() - 0.5) * 8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (fieldLinesRef.current) {
      fieldLinesRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Bar magnet */}
      <group>
        {/* North pole (red) */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial color="#EF4444" metalness={0.6} roughness={0.3} />
        </mesh>
        <Text position={[0, 3.2, 0]} fontSize={0.4} color="#EF4444">N</Text>

        {/* South pole (blue) */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.6} roughness={0.3} />
        </mesh>
        <Text position={[0, -3.2, 0]} fontSize={0.4} color="#3B82F6">S</Text>
      </group>

      {/* Magnetic field lines */}
      <group ref={fieldLinesRef}>
        {fieldLines.map((points, i) => (
          <Line
            key={i}
            points={points}
            color="#A855F7"
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        ))}
      </group>

      {/* Iron filings visualization */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#888" transparent opacity={0.8} />
      </points>

      {/* Direction arrows on field lines */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshBasicMaterial color="#A855F7" />
          </mesh>
        </group>
      ))}

      {/* Labels */}
      <Text position={[0, 5, 0]} fontSize={0.35} color="#888">
        Magnetic Field Lines
      </Text>
      <Text position={[0, 4.5, 0]} fontSize={0.2} color="#666">
        B field: N → S (outside magnet)
      </Text>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default MagneticFieldSimulation;
