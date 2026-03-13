import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Torus } from '@react-three/drei';
import * as THREE from 'three';

export const GyroscopeSimulation = () => {
  const outerRingRef = useRef<THREE.Group>(null);
  const middleRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Spinning wheel (main rotation)
    if (wheelRef.current) {
      wheelRef.current.rotation.x += delta * 15;
    }

    // Precession of the gyroscope
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = time * 0.3;
    }

    // Nutation (wobble)
    if (middleRingRef.current) {
      middleRingRef.current.rotation.x = Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Stand */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gyroscope assembly */}
      <group ref={outerRingRef} position={[0, 0.5, 0]}>
        {/* Outer gimbal ring */}
        <Torus args={[1.8, 0.08, 16, 64]}>
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </Torus>

        <group ref={middleRingRef}>
          {/* Middle gimbal ring */}
          <Torus args={[1.5, 0.08, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.1} />
          </Torus>

          <group ref={innerRingRef}>
            {/* Inner ring */}
            <Torus args={[1.2, 0.08, 16, 64]}>
              <meshStandardMaterial color="#808080" metalness={0.9} roughness={0.1} />
            </Torus>

            {/* Spinning wheel */}
            <mesh ref={wheelRef}>
              <torusGeometry args={[0.8, 0.15, 16, 64]} />
              <meshStandardMaterial 
                color="#F59E0B" 
                metalness={0.7} 
                roughness={0.3}
                emissive="#F59E0B"
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* Axle */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 2.6, 16]} />
              <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Spokes */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
                <boxGeometry args={[1.6, 0.05, 0.05]} />
                <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.4} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Angular momentum arrow */}
      <group position={[0, 2.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
        <Text position={[0.5, 0.3, 0]} fontSize={0.2} color="#22C55E">
          L
        </Text>
      </group>

      {/* Labels */}
      <Text position={[0, 4, 0]} fontSize={0.35} color="#888">
        Gyroscope - Angular Momentum
      </Text>
      <Text position={[0, 3.5, 0]} fontSize={0.2} color="#666">
        L = I × ω (precession due to torque)
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default GyroscopeSimulation;
