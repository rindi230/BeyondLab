import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshReflectorMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface Ball {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  mass: number;
}

export const CollisionSimulation = () => {
  const ball1Ref = useRef<THREE.Mesh>(null);
  const ball2Ref = useRef<THREE.Mesh>(null);
  
  const [balls] = useState<Ball[]>([
    { 
      position: new THREE.Vector3(-5, 0, 0), 
      velocity: new THREE.Vector3(3, 0, 0), 
      color: '#EF4444',
      mass: 1
    },
    { 
      position: new THREE.Vector3(5, 0, 0), 
      velocity: new THREE.Vector3(-2, 0, 0), 
      color: '#3B82F6',
      mass: 1.5
    },
  ]);

  const [hasCollided, setHasCollided] = useState(false);
  const [sparkPositions, setSparkPositions] = useState<THREE.Vector3[]>([]);

  useFrame((_, delta) => {
    if (!ball1Ref.current || !ball2Ref.current) return;

    // Update positions
    balls[0].position.add(balls[0].velocity.clone().multiplyScalar(delta));
    balls[1].position.add(balls[1].velocity.clone().multiplyScalar(delta));

    ball1Ref.current.position.copy(balls[0].position);
    ball2Ref.current.position.copy(balls[1].position);

    // Check collision
    const distance = balls[0].position.distanceTo(balls[1].position);
    const collisionDistance = 1; // Sum of radii

    if (distance < collisionDistance && !hasCollided) {
      setHasCollided(true);
      
      // Elastic collision physics
      const m1 = balls[0].mass;
      const m2 = balls[1].mass;
      const v1 = balls[0].velocity.clone();
      const v2 = balls[1].velocity.clone();
      
      // Conservation of momentum for 1D elastic collision
      const newV1 = v1.clone().multiplyScalar((m1 - m2) / (m1 + m2))
        .add(v2.clone().multiplyScalar((2 * m2) / (m1 + m2)));
      const newV2 = v2.clone().multiplyScalar((m2 - m1) / (m1 + m2))
        .add(v1.clone().multiplyScalar((2 * m1) / (m1 + m2)));
      
      balls[0].velocity.copy(newV1);
      balls[1].velocity.copy(newV2);

      // Create sparks at collision point
      const collisionPoint = balls[0].position.clone().add(balls[1].position).multiplyScalar(0.5);
      const sparks = Array.from({ length: 20 }, () => collisionPoint.clone());
      setSparkPositions(sparks);
      
      // Clear sparks after a moment
      setTimeout(() => setSparkPositions([]), 500);
    }

    // Bounce off walls
    const boundary = 8;
    balls.forEach((ball) => {
      if (Math.abs(ball.position.x) > boundary) {
        ball.velocity.x *= -0.9;
        ball.position.x = Math.sign(ball.position.x) * boundary;
        setHasCollided(false); // Allow new collision
      }
    });

    // Rotate balls
    ball1Ref.current.rotation.z -= delta * 2;
    ball2Ref.current.rotation.z += delta * 2;
  });

  return (
    <group>
      {/* Ball 1 */}
      <Trail
        width={1}
        length={8}
        color={balls[0].color}
        attenuation={(t) => t * t}
      >
        <Sphere ref={ball1Ref} args={[0.5, 32, 32]} position={balls[0].position}>
          <meshStandardMaterial 
            color={balls[0].color}
            metalness={0.4}
            roughness={0.3}
            emissive={balls[0].color}
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Trail>
      <pointLight position={balls[0].position} intensity={2} color={balls[0].color} distance={3} />
      
      {/* Ball 2 */}
      <Trail
        width={1.2}
        length={8}
        color={balls[1].color}
        attenuation={(t) => t * t}
      >
        <Sphere ref={ball2Ref} args={[0.6, 32, 32]} position={balls[1].position}>
          <meshStandardMaterial 
            color={balls[1].color}
            metalness={0.4}
            roughness={0.3}
            emissive={balls[1].color}
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Trail>
      <pointLight position={balls[1].position} intensity={2} color={balls[1].color} distance={3} />
      
      {/* Collision sparks */}
      {sparkPositions.map((pos, i) => (
        <SparkParticle key={i} startPosition={pos} index={i} />
      ))}
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          color="#050505"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>
      
      {/* Momentum vectors (visual) */}
      <VelocityArrow position={balls[0].position} velocity={balls[0].velocity} color="#EF4444" />
      <VelocityArrow position={balls[1].position} velocity={balls[1].velocity} color="#3B82F6" />
    </group>
  );
};

const SparkParticle = ({ startPosition, index }: { startPosition: THREE.Vector3; index: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 8,
    Math.random() * 5,
    (Math.random() - 0.5) * 8
  ));
  
  useFrame((_, delta) => {
    if (ref.current) {
      velocity.current.y -= 15 * delta;
      ref.current.position.add(velocity.current.clone().multiplyScalar(delta));
      ref.current.scale.multiplyScalar(0.95);
    }
  });
  
  return (
    <Sphere ref={ref} args={[0.08, 8, 8]} position={startPosition}>
      <meshBasicMaterial color="#FFD700" />
    </Sphere>
  );
};

const VelocityArrow = ({ position, velocity, color }: { position: THREE.Vector3; velocity: THREE.Vector3; color: string }) => {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (arrowRef.current) {
      arrowRef.current.position.copy(position);
      // Point arrow in velocity direction
      const dir = velocity.clone().normalize();
      arrowRef.current.lookAt(position.clone().add(dir));
    }
  });
  
  const length = velocity.length() * 0.3;
  
  return (
    <group ref={arrowRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, length, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export default CollisionSimulation;
