import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export const LightRefractionSimulation = () => {
  const beamRef = useRef<THREE.Group>(null);
  const angleOfIncidence = Math.PI / 4; // 45 degrees
  const n1 = 1.0; // air
  const n2 = 1.5; // glass
  
  // Snell's law: n1 * sin(θ1) = n2 * sin(θ2)
  const angleOfRefraction = Math.asin((n1 / n2) * Math.sin(angleOfIncidence));
  const criticalAngle = Math.asin(n2 / n1);

  useFrame((state) => {
    if (beamRef.current) {
      // Animate beam intensity
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      beamRef.current.children.forEach(child => {
        if ((child as THREE.Line).material) {
          ((child as THREE.Line).material as THREE.LineBasicMaterial).opacity = pulse;
        }
      });
    }
  });

  // Calculate beam paths
  const incidentStart = new THREE.Vector3(-4, 4, 0);
  const hitPoint = new THREE.Vector3(0, 0, 0);
  const refractedEnd = new THREE.Vector3(
    Math.sin(angleOfRefraction) * 4,
    -4,
    0
  );
  const reflectedEnd = new THREE.Vector3(
    Math.sin(angleOfIncidence) * 4,
    4,
    0
  );

  return (
    <group>
      <Text position={[0, 5, 0]} fontSize={0.4} color="#888">
        Light Refraction - Snell's Law
      </Text>

      {/* Air region (top) */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[10, 5, 5]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.1} />
      </mesh>
      <Text position={[-4, 2, 2]} fontSize={0.25} color="#666">
        Air (n = 1.0)
      </Text>

      {/* Glass region (bottom) */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[10, 5, 5]} />
        <meshStandardMaterial color="#8FAADC" transparent opacity={0.3} />
      </mesh>
      <Text position={[-4, -2, 2]} fontSize={0.25} color="#666">
        Glass (n = 1.5)
      </Text>

      {/* Interface surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Normal line (dashed) */}
      <Line
        points={[[0, -3, 0], [0, 3, 0]]}
        color="#FFFFFF"
        lineWidth={1}
        dashed
        dashScale={5}
      />
      <Text position={[0.5, 2.5, 0]} fontSize={0.2} color="#888">Normal</Text>

      {/* Light beams */}
      <group ref={beamRef}>
        {/* Incident beam (yellow) */}
        <Line
          points={[incidentStart, hitPoint]}
          color="#FFFF00"
          lineWidth={4}
        />
        <mesh position={[incidentStart.x, incidentStart.y, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#FFFF00" />
        </mesh>

        {/* Refracted beam (blue-shifted) */}
        <Line
          points={[hitPoint, refractedEnd]}
          color="#00BFFF"
          lineWidth={4}
        />

        {/* Partially reflected beam (dimmer) */}
        <Line
          points={[hitPoint, reflectedEnd]}
          color="#FFFF00"
          lineWidth={2}
          transparent
          opacity={0.3}
        />
      </group>

      {/* Hit point glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFFF00" distance={3} />

      {/* Angle arcs */}
      {/* Incident angle */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, -angleOfIncidence / 2]}>
        <ringGeometry args={[0.8, 0.85, 16, 1, 0, angleOfIncidence]} />
        <meshBasicMaterial color="#FFFF00" side={THREE.DoubleSide} />
      </mesh>
      <Text position={[-0.8, 1.2, 0]} fontSize={0.2} color="#FFFF00">
        θ₁ = {(angleOfIncidence * 180 / Math.PI).toFixed(0)}°
      </Text>

      {/* Refracted angle */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI + angleOfRefraction / 2]}>
        <ringGeometry args={[0.8, 0.85, 16, 1, 0, angleOfRefraction]} />
        <meshBasicMaterial color="#00BFFF" side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0.8, -1.2, 0]} fontSize={0.2} color="#00BFFF">
        θ₂ = {(angleOfRefraction * 180 / Math.PI).toFixed(0)}°
      </Text>

      {/* Formula */}
      <group position={[4, 2, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.25} color="#888" anchorX="left">
          Snell's Law:
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#666" anchorX="left">
          n₁ sin θ₁ = n₂ sin θ₂
        </Text>
        <Text position={[0, -0.8, 0]} fontSize={0.2} color="#666" anchorX="left">
          {n1} × sin({(angleOfIncidence * 180 / Math.PI).toFixed(0)}°) = {n2} × sin({(angleOfRefraction * 180 / Math.PI).toFixed(0)}°)
        </Text>
      </group>

      {/* Direction arrows */}
      <mesh position={[-2, 2, 0]} rotation={[0, 0, -angleOfIncidence - Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#FFFF00" />
      </mesh>
      <mesh position={[refractedEnd.x / 2, refractedEnd.y / 2, 0]} rotation={[0, 0, -Math.PI / 2 + angleOfRefraction]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#00BFFF" />
      </mesh>
    </group>
  );
};

export default LightRefractionSimulation;
