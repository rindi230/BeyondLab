import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface Particle {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'neutron' | 'proton' | 'fragment';
  color: string;
  size: number;
}

interface Fragment {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
}

export const NuclearFissionSimulation = () => {
  const [phase, setPhase] = useState<'approaching' | 'collision' | 'fission' | 'chain'>('approaching');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  
  const neutronRef = useRef<THREE.Mesh>(null);
  const nucleusRef = useRef<THREE.Group>(null);
  
  const neutronPos = useRef(new THREE.Vector3(-8, 0, 0));
  const nucleusScale = useRef(1);

  // Create nucleus structure
  const nucleons = useMemo(() => {
    const particles: Array<{ position: THREE.Vector3; type: 'proton' | 'neutron' }> = [];
    const count = 24;
    
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 0.8;
      
      particles.push({
        position: new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        ),
        type: i % 2 === 0 ? 'proton' : 'neutron',
      });
    }
    
    return particles;
  }, []);

  // Reset simulation
  useEffect(() => {
    const resetSimulation = () => {
      setPhase('approaching');
      setParticles([]);
      setFragments([]);
      neutronPos.current = new THREE.Vector3(-8, 0, 0);
      nucleusScale.current = 1;
    };
    
    const interval = setInterval(resetSimulation, 8000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (phase === 'approaching') {
      // Move neutron toward nucleus
      neutronPos.current.x += delta * 4;
      
      if (neutronRef.current) {
        neutronRef.current.position.copy(neutronPos.current);
      }
      
      // Collision check
      if (neutronPos.current.x > -0.5) {
        setPhase('collision');
      }
    }
    
    if (phase === 'collision') {
      // Nucleus wobbles and expands
      nucleusScale.current = 1 + Math.sin(time * 20) * 0.2;
      
      if (nucleusRef.current) {
        nucleusRef.current.scale.setScalar(nucleusScale.current);
      }
      
      // Trigger fission after wobble
      setTimeout(() => setPhase('fission'), 500);
    }
    
    if (phase === 'fission' && fragments.length === 0) {
      // Create fragments
      const newFragments: Fragment[] = [
        {
          id: 'frag1',
          position: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(3, 1, 0.5),
          rotation: new THREE.Euler(0, 0, 0),
          rotationSpeed: new THREE.Vector3(2, 3, 1),
        },
        {
          id: 'frag2',
          position: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(-3, -0.5, -0.5),
          rotation: new THREE.Euler(0, 0, 0),
          rotationSpeed: new THREE.Vector3(-2, 1, -3),
        },
      ];
      
      // Create released neutrons
      const newParticles: Particle[] = Array.from({ length: 3 }, (_, i) => ({
        id: `neutron-${i}`,
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        ),
        type: 'neutron' as const,
        color: '#00FF00',
        size: 0.1,
      }));
      
      setFragments(newFragments);
      setParticles(newParticles);
    }
    
    // Update fragments
    if (phase === 'fission' || phase === 'chain') {
      setFragments(prev => prev.map(frag => ({
        ...frag,
        position: frag.position.clone().add(frag.velocity.clone().multiplyScalar(delta)),
        rotation: new THREE.Euler(
          frag.rotation.x + frag.rotationSpeed.x * delta,
          frag.rotation.y + frag.rotationSpeed.y * delta,
          frag.rotation.z + frag.rotationSpeed.z * delta
        ),
      })));
      
      // Update particles
      setParticles(prev => prev.map(p => ({
        ...p,
        position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
      })));
    }
  });

  return (
    <group>
      {/* Incoming neutron */}
      {phase === 'approaching' && (
        <Trail width={0.3} length={6} color="#39FF14" attenuation={(t) => t * t}>
          <Sphere ref={neutronRef} args={[0.15, 16, 16]} position={neutronPos.current}>
            <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={0.8} />
          </Sphere>
        </Trail>
      )}
      
      {/* Uranium nucleus */}
      {(phase === 'approaching' || phase === 'collision') && (
        <group ref={nucleusRef}>
          {nucleons.map((nucleon, i) => (
            <Sphere key={i} args={[0.15, 16, 16]} position={nucleon.position}>
              <meshStandardMaterial 
                color={nucleon.type === 'proton' ? '#FF4444' : '#4444FF'}
                emissive={nucleon.type === 'proton' ? '#FF4444' : '#4444FF'}
                emissiveIntensity={0.3}
              />
            </Sphere>
          ))}
        </group>
      )}
      
      {/* Fission fragments */}
      {fragments.map((frag) => (
        <group key={frag.id} position={frag.position} rotation={frag.rotation}>
          {nucleons.slice(0, 12).map((nucleon, i) => (
            <Sphere key={i} args={[0.12, 16, 16]} position={nucleon.position.clone().multiplyScalar(0.6)}>
              <meshStandardMaterial 
                color={nucleon.type === 'proton' ? '#FF4444' : '#4444FF'}
                emissive={nucleon.type === 'proton' ? '#FF4444' : '#4444FF'}
                emissiveIntensity={0.5}
              />
            </Sphere>
          ))}
        </group>
      ))}
      
      {/* Released neutrons */}
      {particles.map((p) => (
        <Trail key={p.id} width={0.2} length={4} color="#39FF14" attenuation={(t) => t * t}>
          <Sphere args={[0.1, 16, 16]} position={p.position}>
            <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={1} />
          </Sphere>
        </Trail>
      ))}
      
      {/* Energy flash on fission */}
      {phase === 'fission' && (
        <EnergyFlash />
      )}
      
      {/* Labels */}
      <LabelsAndInfo phase={phase} />
    </group>
  );
};

const EnergyFlash = () => {
  const ref = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.1);
  
  useFrame((_, delta) => {
    setScale(prev => Math.min(prev + delta * 8, 3));
    if (ref.current) {
      ref.current.scale.setScalar(scale);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - scale / 3);
    }
  });
  
  return (
    <Sphere ref={ref} args={[1, 32, 32]}>
      <meshBasicMaterial color="#FFFF00" transparent opacity={0.8} />
    </Sphere>
  );
};

const LabelsAndInfo = ({ phase }: { phase: string }) => {
  return (
    <group position={[0, -4, 0]}>
      {/* Phase indicator would go here - using simple mesh for now */}
    </group>
  );
};

export default NuclearFissionSimulation;
