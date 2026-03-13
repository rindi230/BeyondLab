import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const STAR_SHADER = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#F59E0B') },
    uPhase: { value: 0 }, // 0: star, 1: collapse, 2: explosion, 3: remnant
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uPhase;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      float pulse = 0.0;
      if (uPhase == 0.0) {
        pulse = sin(uTime * 2.0) * 0.05;
      }
      
      vec3 pos = position * (1.0 + pulse);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uPhase;

    // Pseudo-random noise
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      float intensity = pow(0.7 - dot(normal, vec3(0, 0, 1.0)), 2.0);
      
      // Roiling plasma effect
      float n = noise(vPosition * 2.0 + uTime * 0.2);
      n += noise(vPosition * 4.0 - uTime * 0.3) * 0.5;
      
      vec3 color = uColor;
      if (uPhase == 1.0) { // Collapse
        color = mix(uColor, vec3(1.0, 0.2, 0.1), intensity);
      } else if (uPhase == 2.0) { // Explosion
        color = vec3(1.0, 1.0, 1.0);
      } else if (uPhase == 3.0) { // Remnant
        color = vec3(0.2, 0.5, 1.0);
      }

      vec3 finalColor = color + vec3(1.0, 0.6, 0.1) * n * 0.3;
      gl_FragColor = vec4(finalColor + intensity * color, 1.0);
    }
  `
};

const SHOCKWAVE_SHADER = {
  uniforms: {
    uTime: { value: 0 },
    uRadius: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform float uRadius;
    void main() {
      float intensity = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1.0))), 4.0);
      float distFade = max(0.0, 1.0 - uRadius / 15.0);
      gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * distFade * 0.8);
    }
  `
};

export const SupernovaSimulation = () => {
  const [phase, setPhase] = useState<'star' | 'collapse' | 'explosion' | 'remnant'>('star');
  const starRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const phaseDurations = {
    star: 5000,
    collapse: 1000,
    explosion: 3000,
    remnant: 5000
  };

  const nebulaCount = 3000;
  const [nebulaPositions, nebulaVelocities, nebulaColors] = useMemo(() => {
    const pos = new Float32Array(nebulaCount * 3);
    const vel = new Float32Array(nebulaCount * 3);
    const col = new Float32Array(nebulaCount * 3);

    const purple = new THREE.Color('#A855F7');
    const blue = new THREE.Color('#3B82F6');
    const red = new THREE.Color('#EF4444');

    for (let i = 0; i < nebulaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.2 + Math.random() * 1.5;

      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.cos(phi) * speed;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      const mixColor = Math.random() > 0.5 ? purple : (Math.random() > 0.5 ? blue : red);
      col[i * 3] = mixColor.r;
      col[i * 3 + 1] = mixColor.g;
      col[i * 3 + 2] = mixColor.b;

      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return [pos, vel, col];
  }, []);

  // Phase transition logic
  useEffect(() => {
    let currentPhase: typeof phase = 'star';
    let timeoutId: any;

    const sequence = () => {
      if (currentPhase === 'star') currentPhase = 'collapse';
      else if (currentPhase === 'collapse') currentPhase = 'explosion';
      else if (currentPhase === 'explosion') currentPhase = 'remnant';
      else currentPhase = 'star';

      setPhase(currentPhase);

      // Reset nebula if going back to star
      if (currentPhase === 'star' && nebulaRef.current) {
        const posAttr = nebulaRef.current.geometry.attributes.position;
        for (let i = 0; i < nebulaCount * 3; i++) posAttr.array[i] = 0;
        posAttr.needsUpdate = true;
      }

      timeoutId = setTimeout(sequence, phaseDurations[currentPhase]);
    };

    timeoutId = setTimeout(sequence, phaseDurations.star);
    return () => clearTimeout(timeoutId);
  }, []);

  const starMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(STAR_SHADER.uniforms),
    vertexShader: STAR_SHADER.vertexShader,
    fragmentShader: STAR_SHADER.fragmentShader,
  }), []);

  const shockwaveMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(SHOCKWAVE_SHADER.uniforms),
    vertexShader: SHOCKWAVE_SHADER.vertexShader,
    fragmentShader: SHOCKWAVE_SHADER.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update Shaders
    starMaterial.uniforms.uTime.value = time;
    starMaterial.uniforms.uPhase.value =
      phase === 'star' ? 0 : phase === 'collapse' ? 1 : phase === 'explosion' ? 2 : 3;

    if (starRef.current) {
      if (phase === 'star') {
        starRef.current.scale.setScalar(2);
      } else if (phase === 'collapse') {
        const t = (state.clock.elapsedTime * 1000) % phaseDurations.collapse / phaseDurations.collapse;
        starRef.current.scale.setScalar(2 * (1 - t * 0.8));
      } else if (phase === 'explosion') {
        starRef.current.scale.setScalar(0.4);
      } else if (phase === 'remnant') {
        starRef.current.scale.setScalar(0.2);
        starRef.current.rotation.y += 0.05; // Rotating remnant
      }
    }

    // Shockwave
    if (shockwaveRef.current && (phase === 'explosion' || phase === 'remnant')) {
      const t = (state.clock.elapsedTime * 1000) % phaseDurations.explosion / phaseDurations.explosion;
      const radius = phase === 'explosion' ? t * 20 : 20;
      shockwaveRef.current.scale.setScalar(radius);
      shockwaveMaterial.uniforms.uRadius.value = radius;
    }

    // Nebula/Ejecta
    if (nebulaRef.current && (phase === 'explosion' || phase === 'remnant')) {
      const posAttr = nebulaRef.current.geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < nebulaCount; i++) {
        posArray[i * 3] += nebulaVelocities[i * 3] * 0.05;
        posArray[i * 3 + 1] += nebulaVelocities[i * 3 + 1] * 0.05;
        posArray[i * 3 + 2] += nebulaVelocities[i * 3 + 2] * 0.05;
      }
      posAttr.needsUpdate = true;
    }

    // Lighting
    if (lightRef.current) {
      if (phase === 'explosion') {
        lightRef.current.intensity = 200 * (1 + Math.sin(time * 20)); // Flickering bright light
      } else if (phase === 'remnant') {
        lightRef.current.intensity = 20;
        lightRef.current.color.setHex(0x3B82F6);
      } else {
        lightRef.current.intensity = 30;
        lightRef.current.color.setHex(0xF59E0B);
      }
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text position={[0, 6, 0]} fontSize={0.5} color="#fff">
          SUPERNOVA
        </Text>
        <Text position={[0, 5.4, 0]} fontSize={0.2} color="#aaa">
          TYPE II CORE COLLAPSE
        </Text>
      </Float>

      {/* Main Star */}
      <mesh ref={starRef} material={starMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Point Light representing the core's energy */}
      <pointLight ref={lightRef} position={[0, 0, 0]} />

      {/* Shockwave */}
      {(phase === 'explosion' || phase === 'remnant') && (
        <mesh ref={shockwaveRef} material={shockwaveMaterial}>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
      )}

      {/* Nebula Ejecta */}
      {(phase === 'explosion' || phase === 'remnant') && (
        <points ref={nebulaRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={nebulaCount}
              array={nebulaPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={nebulaCount}
              array={nebulaColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            vertexColors
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      )}

      {/* Pulsar Beams (during remnant phase) */}
      {phase === 'remnant' && (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.02, 0.4, 10, 16]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -5, 0]}>
            <cylinderGeometry args={[0.4, 0.02, 10, 16]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Info Boxes */}
      <group position={[6, 0, 0]}>
        <mesh>
          <planeGeometry args={[4, 3]} />
          <meshBasicMaterial color="#000" transparent opacity={0.5} />
        </mesh>
        <Text position={[0, 1.2, 0.1]} fontSize={0.2} color="#fff">STAGES</Text>
        <group position={[-1.8, 0.8, 0.1]}>
          <Text fontSize={0.15} color={phase === 'star' ? '#F59E0B' : '#444'} anchorX="left">
            ● Stellar Stability
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.15} color={phase === 'collapse' ? '#EF4444' : '#444'} anchorX="left">
            ● Core Implosion
          </Text>
          <Text position={[0, -0.8, 0]} fontSize={0.15} color={phase === 'explosion' ? '#FFF' : '#444'} anchorX="left">
            ● Neutrino Bounce
          </Text>
          <Text position={[0, -1.2, 0]} fontSize={0.15} color={phase === 'remnant' ? '#3B82F6' : '#444'} anchorX="left">
            ● Compact Remnant
          </Text>
        </group>
      </group>
    </group>
  );
};

export default SupernovaSimulation;
