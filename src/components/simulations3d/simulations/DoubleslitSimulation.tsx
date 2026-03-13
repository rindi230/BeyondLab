import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const DoubleslitSimulation = () => {
  const wavesRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  // Generate interference pattern for the screen
  const interferencePattern = useMemo(() => {
    const width = 256;
    const height = 64;
    const data = new Uint8Array(width * height * 4);
    
    const slitSeparation = 0.1;
    const wavelength = 0.02;
    
    for (let x = 0; x < width; x++) {
      const screenX = (x - width / 2) / width * 4;
      
      // Calculate path difference
      const d1 = Math.sqrt(screenX * screenX + 4);
      const d2 = Math.sqrt((screenX - slitSeparation) * (screenX - slitSeparation) + 4);
      const pathDiff = Math.abs(d1 - d2);
      
      // Interference: constructive when path diff = n * wavelength
      const intensity = Math.cos(pathDiff / wavelength * Math.PI * 2) * 0.5 + 0.5;
      const brightness = Math.floor(intensity * 255);
      
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        data[idx] = brightness;
        data[idx + 1] = brightness;
        data[idx + 2] = Math.floor(brightness * 1.2);
        data[idx + 3] = 255;
      }
    }
    
    const texture = new THREE.DataTexture(data, width, height);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Wave particles
  const waveParticles = useMemo(() => {
    const particles: { x: number; y: number; z: number; fromSlit: number; speed: number }[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: -3,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
        fromSlit: Math.random() > 0.5 ? 1 : 2,
        speed: 0.8 + Math.random() * 0.4,
      });
    }
    return particles;
  }, []);

  const particlesRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(100 * 3), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate wave rings
    if (wavesRef.current) {
      wavesRef.current.children.forEach((ring, i) => {
        const scale = ((time * 0.5 + i * 0.2) % 2) + 0.1;
        ring.scale.set(scale, scale, 1);
        const mat = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 0.6 - scale * 0.25;
      });
    }

    // Animate particles
    if (particlesRef.current) {
      waveParticles.forEach((p, i) => {
        p.x += p.speed * 0.02;
        
        if (p.x < 0) {
          // Before slits
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y * 0.5;
        } else {
          // After slits - spread in interference pattern
          const slitY = p.fromSlit === 1 ? 0.3 : -0.3;
          const spread = p.x * 0.3;
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = slitY + Math.sin(time * 3 + i) * spread;
        }
        positions[i * 3 + 2] = p.z;

        if (p.x > 4) {
          p.x = -3;
          p.y = (Math.random() - 0.5) * 0.5;
          p.fromSlit = Math.random() > 0.5 ? 1 : 2;
        }
      });
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <Text position={[0, 3.5, 0]} fontSize={0.4} color="#888">
        Double-Slit Experiment
      </Text>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#666">
        Wave-Particle Duality
      </Text>

      {/* Light/particle source */}
      <mesh position={[-4, 0, 0]}>
        <boxGeometry args={[0.5, 1.5, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <pointLight position={[-3.5, 0, 0]} intensity={3} color="#00FFFF" distance={3} />

      {/* Barrier with double slit */}
      <group position={[0, 0, 0]}>
        {/* Top part */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.2, 1.5, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Middle part */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.3, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Bottom part */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[0.2, 1.5, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Slit labels */}
        <Text position={[0.3, 0.45, 0]} fontSize={0.15} color="#00FFFF">Slit 1</Text>
        <Text position={[0.3, -0.45, 0]} fontSize={0.15} color="#00FFFF">Slit 2</Text>
      </group>

      {/* Wave rings from each slit */}
      <group ref={wavesRef}>
        {/* From slit 1 */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`s1-${i}`} position={[0.2, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* From slit 2 */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`s2-${i}`} position={[0.2, -0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#00FFFF" transparent opacity={0.8} />
      </points>

      {/* Detection screen with interference pattern */}
      <mesh ref={screenRef} position={[4, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshBasicMaterial map={interferencePattern} />
      </mesh>

      {/* Labels */}
      <Text position={[-4, -1.5, 0]} fontSize={0.2} color="#666">Source</Text>
      <Text position={[0, -2, 0]} fontSize={0.2} color="#666">Barrier</Text>
      <Text position={[4, -2.5, 0]} fontSize={0.2} color="#666">Interference Pattern</Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default DoubleslitSimulation;
