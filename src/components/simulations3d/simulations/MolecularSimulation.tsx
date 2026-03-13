import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Shaders ---

const ATOM_GLOW_SHADER = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#FFFFFF') },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec3 uColor;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.2 - max(dot(vNormal, viewDir), 0.0), 3.0);
      gl_FragColor = vec4(uColor, fresnel * 0.4);
    }
  `
};

const BOND_ENERGY_SHADER = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#AAAAAA') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    void main() {
      float pulse = 0.5 + 0.5 * sin(vUv.y * 10.0 - uTime * 5.0);
      float alpha = 0.2 + 0.4 * pulse;
      vec3 glowColor = mix(uColor, vec3(1.0), pulse * 0.3);
      gl_FragColor = vec4(glowColor, alpha);
    }
  `
};

interface Atom {
  position: THREE.Vector3;
  color: string;
  size: number;
  velocity: THREE.Vector3;
}

interface Bond {
  from: number;
  to: number;
}

export const MolecularSimulation = () => {
  const moleculeRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Water molecule H2O structure
  const { atoms, bonds } = useMemo(() => {
    const atoms: Atom[] = [
      // Oxygen (center)
      { position: new THREE.Vector3(0, 0, 0), color: '#FF4444', size: 0.5, velocity: new THREE.Vector3() },
      // Hydrogen 1
      { position: new THREE.Vector3(-0.9, 0.7, 0), color: '#FFFFFF', size: 0.3, velocity: new THREE.Vector3() },
      // Hydrogen 2
      { position: new THREE.Vector3(0.9, 0.7, 0), color: '#FFFFFF', size: 0.3, velocity: new THREE.Vector3() },
    ];

    const bonds: Bond[] = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
    ];

    return { atoms, bonds };
  }, []);

  const bondMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(BOND_ENERGY_SHADER.uniforms),
    vertexShader: BOND_ENERGY_SHADER.vertexShader,
    fragmentShader: BOND_ENERGY_SHADER.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  // Additional floating molecules
  const floatingMolecules = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 10
      ),
      rotation: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    bondMaterial.uniforms.uTime.value = time;

    if (moleculeRef.current) {
      // Gentle physics-like rotation
      moleculeRef.current.rotation.y += delta * 0.3;
      moleculeRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
      moleculeRef.current.rotation.z = Math.cos(time * 0.3) * 0.05;

      // Brownian thermal vibration
      moleculeRef.current.children.forEach((child, i) => {
        if (child.name === 'atom') {
          const noise = new THREE.Vector3(
            Math.sin(time * 8 + i) * 0.005,
            Math.cos(time * 10 + i) * 0.005,
            Math.sin(time * 9 + i) * 0.005
          );
          child.position.add(noise);
        }
      });
    }
  });

  const getBondMesh = (from: THREE.Vector3, to: THREE.Vector3) => {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

    // Calculate rotation to align cylinder with bond direction
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    return { center, length, rotation: [euler.x, euler.y, euler.z] as [number, number, number] };
  };

  return (
    <group>
      <Sparkles count={50} scale={10} size={1} speed={0.2} opacity={0.2} />

      {/* Main molecule */}
      <group ref={moleculeRef} scale={1.8}>
        {/* Atoms */}
        {atoms.map((atom, i) => (
          <group
            key={i}
            position={atom.position}
            name="atom"
            onPointerOver={() => setHovered(i)}
            onPointerOut={() => setHovered(null)}
          >
            {/* Core Atom */}
            <Sphere args={[atom.size, 48, 48]}>
              <meshStandardMaterial
                color={atom.color}
                metalness={0.8}
                roughness={0.1}
                emissive={atom.color}
                emissiveIntensity={hovered === i ? 0.5 : 0.2}
              />
            </Sphere>

            {/* Fresnel Glow */}
            <Sphere args={[atom.size * 1.2, 32, 32]}>
              <primitive
                object={new THREE.ShaderMaterial({
                  ...ATOM_GLOW_SHADER,
                  uniforms: { ...ATOM_GLOW_SHADER.uniforms, uColor: { value: new THREE.Color(atom.color) } },
                  transparent: true,
                  depthWrite: false,
                  blending: THREE.AdditiveBlending
                })}
                attach="material"
              />
            </Sphere>

            <pointLight intensity={2} color={atom.color} distance={4} />
          </group>
        ))}

        {/* Bonds */}
        {bonds.map((bond, i) => {
          const { center, length, rotation } = getBondMesh(
            atoms[bond.from].position,
            atoms[bond.to].position
          );
          return (
            <group key={i} position={center} rotation={rotation}>
              {/* Central Core */}
              <Cylinder args={[0.02, 0.02, length, 8]}>
                <meshBasicMaterial color="#FFFFFF" />
              </Cylinder>
              {/* Energy Sheath */}
              <Cylinder args={[0.08, 0.08, length, 16]}>
                <primitive object={bondMaterial} attach="material" />
              </Cylinder>
            </group>
          );
        })}
      </group>

      {/* Floating molecules in background */}
      {floatingMolecules.map((mol, i) => (
        <FloatingMolecule key={i} {...mol} index={i} />
      ))}

      {/* Ambient particles */}
      <ElectronCloud />
    </group>
  );
};

interface FloatingMoleculeProps {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  phase: number;
  index: number;
}

const FloatingMolecule = ({ position, rotation, speed, phase, index }: FloatingMoleculeProps) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed + rotation;
      ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime + phase) * 0.5;
    }
  });

  const isCO2 = index % 2 === 0;

  return (
    <group ref={ref} position={position} scale={0.5}>
      {isCO2 ? (
        // CO2 molecule
        <>
          <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#333" metalness={0.3} roughness={0.6} />
          </Sphere>
          <Sphere args={[0.25, 16, 16]} position={[-0.6, 0, 0]}>
            <meshStandardMaterial color="#FF4444" metalness={0.3} roughness={0.6} />
          </Sphere>
          <Sphere args={[0.25, 16, 16]} position={[0.6, 0, 0]}>
            <meshStandardMaterial color="#FF4444" metalness={0.3} roughness={0.6} />
          </Sphere>
        </>
      ) : (
        // H2O molecule
        <>
          <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#FF4444" metalness={0.3} roughness={0.6} />
          </Sphere>
          <Sphere args={[0.2, 16, 16]} position={[-0.5, 0.4, 0]}>
            <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.6} />
          </Sphere>
          <Sphere args={[0.2, 16, 16]} position={[0.5, 0.4, 0]}>
            <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.6} />
          </Sphere>
        </>
      )}
    </group>
  );
};

const ElectronCloud = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 12;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#44FFFF"
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Float>
  );
};

export default MolecularSimulation;
