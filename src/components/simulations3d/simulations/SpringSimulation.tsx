import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const SpringSimulation = () => {
  const massRef = useRef<THREE.Mesh>(null);
  const springRef = useRef<THREE.Group>(null);
  
  const positionRef = useRef(2);
  const velocityRef = useRef(0);
  const restPosition = 0;
  const springConstant = 15;
  const damping = 0.98;
  const mass = 1;

  // Generate spring coil points
  const springPoints = useMemo(() => {
    const coils = 12;
    const radius = 0.3;
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= coils * 20; i++) {
      const t = i / (coils * 20);
      const angle = t * coils * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        t * 4 - 2,
        Math.sin(angle) * radius
      ));
    }
    
    return points;
  }, []);

  useFrame((_, delta) => {
    // Spring physics: F = -kx, a = F/m
    const displacement = positionRef.current - restPosition;
    const acceleration = (-springConstant * displacement) / mass;
    
    velocityRef.current += acceleration * delta;
    velocityRef.current *= damping;
    positionRef.current += velocityRef.current * delta;
    
    if (massRef.current) {
      massRef.current.position.y = positionRef.current - 3;
    }
    
    // Scale spring based on stretch
    if (springRef.current) {
      const stretch = 1 + (positionRef.current - restPosition) * 0.15;
      springRef.current.scale.y = stretch;
      springRef.current.position.y = 3 - (stretch - 1) * 2;
    }
  });

  return (
    <group>
      {/* Ceiling mount */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[2, 0.3, 2]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Spring coil visualization */}
      <group ref={springRef}>
        <mesh>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3(springPoints),
            200,
            0.08,
            8,
            false
          ]} />
          <meshStandardMaterial 
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
      
      {/* Mass */}
      <mesh ref={massRef} position={[0, -1, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#8B5CF6"
          metalness={0.3}
          roughness={0.5}
          emissive="#8B5CF6"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Equilibrium line */}
      <mesh position={[0, -3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshBasicMaterial color="#666" transparent opacity={0.5} />
      </mesh>
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[15, 15]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={1}
          color="#080808"
          metalness={0.5}
          mirror={0.3}
        />
      </mesh>
      
      {/* Force arrows would be added here */}
      <ForceIndicator 
        position={new THREE.Vector3(1.5, positionRef.current - 3, 0)} 
        displacement={positionRef.current} 
      />
    </group>
  );
};

const ForceIndicator = ({ position, displacement }: { position: THREE.Vector3; displacement: number }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = displacement - 3;
    }
  });
  
  return (
    <group ref={ref} position={[1.5, 0, 0]}>
      {/* Spring force arrow (always toward equilibrium) */}
      <mesh rotation={[0, 0, displacement > 0 ? Math.PI : 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>
    </group>
  );
};

export default SpringSimulation;
