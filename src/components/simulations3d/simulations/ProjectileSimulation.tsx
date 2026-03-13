import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text, MeshReflectorMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface ProjectileState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  launched: boolean;
  landed: boolean;
  trajectory: THREE.Vector3[];
}

export const ProjectileSimulation = () => {
  const [projectile, setProjectile] = useState<ProjectileState>({
    position: new THREE.Vector3(-6, 0, 0),
    velocity: new THREE.Vector3(6, 8, 0),
    launched: false,
    landed: false,
    trajectory: [],
  });
  
  const projectileRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const gravity = 9.8;

  // Launch projectile after delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProjectile(prev => ({ ...prev, launched: true }));
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Reset simulation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProjectile({
        position: new THREE.Vector3(-6, 0, 0),
        velocity: new THREE.Vector3(6, 8, 0),
        launched: false,
        landed: false,
        trajectory: [],
      });
      timeRef.current = 0;
      
      setTimeout(() => {
        setProjectile(prev => ({ ...prev, launched: true }));
      }, 1000);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    if (!projectile.launched || projectile.landed) return;
    
    timeRef.current += delta;
    
    // Update velocity (gravity affects y)
    const newVelocity = projectile.velocity.clone();
    newVelocity.y -= gravity * delta;
    
    // Update position
    const newPosition = projectile.position.clone();
    newPosition.add(newVelocity.clone().multiplyScalar(delta));
    
    // Check if landed
    if (newPosition.y <= 0 && newVelocity.y < 0) {
      newPosition.y = 0;
      setProjectile(prev => ({
        ...prev,
        position: newPosition,
        velocity: newVelocity,
        landed: true,
        trajectory: [...prev.trajectory, newPosition.clone()],
      }));
      return;
    }
    
    // Store trajectory point
    setProjectile(prev => ({
      ...prev,
      position: newPosition,
      velocity: newVelocity,
      trajectory: [...prev.trajectory, newPosition.clone()],
    }));
    
    if (projectileRef.current) {
      projectileRef.current.position.copy(newPosition);
      projectileRef.current.rotation.z -= delta * 5;
    }
  });

  // Calculate theoretical trajectory for visualization
  const theoreticalPath = [];
  const v0 = new THREE.Vector3(6, 8, 0);
  const p0 = new THREE.Vector3(-6, 0, 0);
  for (let t = 0; t <= 2; t += 0.05) {
    const x = p0.x + v0.x * t;
    const y = p0.y + v0.y * t - 0.5 * gravity * t * t;
    if (y >= 0) {
      theoreticalPath.push(new THREE.Vector3(x, y, 0));
    }
  }

  return (
    <group>
      {/* Projectile */}
      <Trail width={0.5} length={10} color="#EF4444" attenuation={(t) => t * t}>
        <Sphere 
          ref={projectileRef} 
          args={[0.3, 32, 32]} 
          position={projectile.position}
        >
          <meshStandardMaterial 
            color="#EF4444"
            metalness={0.4}
            roughness={0.3}
            emissive="#EF4444"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Trail>
      
      {/* Theoretical parabolic path */}
      <Line
        points={theoreticalPath}
        color="#666"
        lineWidth={1}
        dashed
        dashScale={2}
      />
      
      {/* Velocity vectors */}
      {!projectile.landed && (
        <group position={projectile.position}>
          {/* Horizontal velocity */}
          <Line
            points={[[0, 0, 0], [projectile.velocity.x * 0.2, 0, 0]]}
            color="#3B82F6"
            lineWidth={3}
          />
          {/* Vertical velocity */}
          <Line
            points={[[0, 0, 0], [0, projectile.velocity.y * 0.2, 0]]}
            color="#22C55E"
            lineWidth={3}
          />
          {/* Resultant velocity */}
          <Line
            points={[[0, 0, 0], [projectile.velocity.x * 0.2, projectile.velocity.y * 0.2, 0]]}
            color="#F59E0B"
            lineWidth={3}
          />
        </group>
      )}
      
      {/* Launch platform */}
      <mesh position={[-6, -0.25, 0]}>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#4B5563" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Landing zone */}
      <mesh position={[6, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.5, 32]} />
        <meshBasicMaterial color="#22C55E" transparent opacity={0.3} />
      </mesh>
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[20, 10]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={1}
          color="#0a0a0a"
          metalness={0.5}
          mirror={0.3}
        />
      </mesh>
      
      {/* Distance markers */}
      {[-4, -2, 0, 2, 4, 6].map((x) => (
        <group key={x}>
          <Text
            position={[x, -0.5, 2]}
            fontSize={0.3}
            color="#666"
            rotation={[-Math.PI / 4, 0, 0]}
          >
            {`${x + 6}m`}
          </Text>
          <mesh position={[x, 0, 0]}>
            <boxGeometry args={[0.02, 0.1, 0.5]} />
            <meshBasicMaterial color="#444" />
          </mesh>
        </group>
      ))}
      
      {/* Height markers */}
      {[2, 4, 6].map((y) => (
        <Text
          key={y}
          position={[-8, y, 0]}
          fontSize={0.25}
          color="#555"
          anchorX="right"
        >
          {`${y}m`}
        </Text>
      ))}
      
      {/* Info display */}
      <group position={[-6, 5, 0]}>
        <Text fontSize={0.3} color="#888" anchorX="left">
          {`v₀ = ${Math.sqrt(36 + 64).toFixed(1)} m/s`}
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.3} color="#888" anchorX="left">
          {`θ = 53.1°`}
        </Text>
        <Text position={[0, -1, 0]} fontSize={0.3} color="#888" anchorX="left">
          {`t = ${timeRef.current.toFixed(2)}s`}
        </Text>
      </group>
    </group>
  );
};

export default ProjectileSimulation;
