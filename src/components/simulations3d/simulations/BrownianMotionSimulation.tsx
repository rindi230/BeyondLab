import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const BrownianMotionSimulation = () => {
  const particlesRef = useRef<THREE.Group>(null);
  const mainParticleRef = useRef<THREE.Mesh>(null);

  const smallParticleCount = 100;
  const velocities = useMemo(() => {
    const v: THREE.Vector3[] = [];
    for (let i = 0; i < smallParticleCount; i++) {
      v.push(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ));
    }
    return v;
  }, []);

  const mainVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const trajectory = useRef<THREE.Vector3[]>([new THREE.Vector3(0, 0, 0)]);

  useFrame((state, delta) => {
    if (!particlesRef.current || !mainParticleRef.current) return;

    const bounds = 3;

    // Update small particles
    particlesRef.current.children.forEach((particle, i) => {
      particle.position.add(velocities[i].clone().multiplyScalar(delta * 3));
      
      // Bounce off walls
      ['x', 'y', 'z'].forEach((axis) => {
        if (Math.abs(particle.position[axis as 'x' | 'y' | 'z']) > bounds) {
          velocities[i][axis as 'x' | 'y' | 'z'] *= -1;
          particle.position[axis as 'x' | 'y' | 'z'] = Math.sign(particle.position[axis as 'x' | 'y' | 'z']) * bounds;
        }
      });

      // Check collision with main particle
      const dist = particle.position.distanceTo(mainParticleRef.current!.position);
      if (dist < 0.5) {
        // Transfer momentum
        const impulse = particle.position.clone()
          .sub(mainParticleRef.current!.position)
          .normalize()
          .multiplyScalar(-0.1);
        mainVelocity.current.add(impulse);
        
        // Bounce small particle
        velocities[i].reflect(particle.position.clone().sub(mainParticleRef.current!.position).normalize());
      }
    });

    // Update main particle (larger, pollen-like)
    mainVelocity.current.multiplyScalar(0.98); // Damping
    mainParticleRef.current.position.add(mainVelocity.current.clone().multiplyScalar(delta * 2));

    // Bounds for main particle
    ['x', 'y', 'z'].forEach((axis) => {
      if (Math.abs(mainParticleRef.current!.position[axis as 'x' | 'y' | 'z']) > bounds - 0.4) {
        mainVelocity.current[axis as 'x' | 'y' | 'z'] *= -0.5;
        mainParticleRef.current!.position[axis as 'x' | 'y' | 'z'] = 
          Math.sign(mainParticleRef.current!.position[axis as 'x' | 'y' | 'z']) * (bounds - 0.4);
      }
    });

    // Store trajectory
    if (trajectory.current.length < 500) {
      trajectory.current.push(mainParticleRef.current.position.clone());
    } else {
      trajectory.current.shift();
      trajectory.current.push(mainParticleRef.current.position.clone());
    }
  });

  return (
    <group>
      <Text position={[0, 5, 0]} fontSize={0.4} color="#888">
        Brownian Motion
      </Text>

      {/* Container */}
      <mesh>
        <boxGeometry args={[6.2, 6.2, 6.2]} />
        <meshStandardMaterial color="#333" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <boxGeometry args={[6.2, 6.2, 6.2]} />
        <meshBasicMaterial color="#444" wireframe />
      </mesh>

      {/* Small particles (water molecules) */}
      <group ref={particlesRef}>
        {Array.from({ length: smallParticleCount }).map((_, i) => (
          <Sphere 
            key={i} 
            args={[0.08, 8, 8]} 
            position={[
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
            ]}
          >
            <meshStandardMaterial color="#0077BE" transparent opacity={0.5} />
          </Sphere>
        ))}
      </group>

      {/* Main particle (pollen grain) */}
      <Sphere ref={mainParticleRef} args={[0.3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#F59E0B" 
          emissive="#F59E0B"
          emissiveIntensity={0.3}
          roughness={0.8}
        />
      </Sphere>

      {/* Trajectory trail */}
      <TrajectoryLine trajectory={trajectory} />

      {/* Legend */}
      <group position={[5, 2, 0]}>
        <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#F59E0B" />
        </Sphere>
        <Text position={[0.5, 0, 0]} fontSize={0.15} color="#888" anchorX="left">
          Pollen grain
        </Text>
        
        <Sphere args={[0.08, 8, 8]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#0077BE" />
        </Sphere>
        <Text position={[0.5, -0.4, 0]} fontSize={0.15} color="#888" anchorX="left">
          Water molecules
        </Text>
      </group>

      {/* Description */}
      <Text position={[0, -4, 0]} fontSize={0.2} color="#666">
        Random motion caused by molecular collisions
      </Text>
      <Text position={[0, -4.4, 0]} fontSize={0.15} color="#888">
        Discovered by Robert Brown (1827)
      </Text>
    </group>
  );
};

const TrajectoryLine = ({ trajectory }: { trajectory: React.MutableRefObject<THREE.Vector3[]> }) => {
  const lineRef = useRef<THREE.Line<THREE.BufferGeometry>>(null);

  useFrame(() => {
    if (lineRef.current && trajectory.current.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trajectory.current);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    }
  });

  return (
    <primitive object={new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#F59E0B', transparent: true, opacity: 0.4 }))} ref={lineRef} />
  );
};

export default BrownianMotionSimulation;
