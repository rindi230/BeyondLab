import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

type ReactionPhase = 'reactants' | 'transition' | 'products';

export const ChemicalReactionSimulation = () => {
  const [phase, setPhase] = useState<ReactionPhase>('reactants');
  const moleculesRef = useRef<THREE.Group>(null);
  const energyRef = useRef(0);

  // Cycle through phases
  useEffect(() => {
    const phases: ReactionPhase[] = ['reactants', 'transition', 'products'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Energy progression through reaction
    if (phase === 'reactants') {
      energyRef.current = 0;
    } else if (phase === 'transition') {
      energyRef.current = 1.5; // Activation energy peak
    } else {
      energyRef.current = -0.5; // Lower energy products
    }
  });

  // Energy diagram points
  const energyPath = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let x = -3; x <= 3; x += 0.1) {
      // Gaussian peak for activation energy
      const y = -0.5 + 2 * Math.exp(-Math.pow(x, 2) / 0.8) - (x > 0 ? 0.5 : 0);
      points.push([x, y, 0]);
    }
    return points;
  }, []);

  return (
    <group>
      <Text position={[0, 5, 0]} fontSize={0.4} color="#888">
        Chemical Reaction
      </Text>
      <Text position={[0, 4.5, 0]} fontSize={0.25} color={
        phase === 'reactants' ? '#3B82F6' :
          phase === 'transition' ? '#F59E0B' : '#22C55E'
      }>
        {phase === 'reactants' ? 'Reactants' :
          phase === 'transition' ? 'Transition State' : 'Products'}
      </Text>

      {/* Reaction visualization */}
      <group ref={moleculesRef} position={[0, 1.5, 0]}>
        {phase === 'reactants' && (
          <group>
            {/* H2 molecule */}
            <group position={[-2, 0, 0]}>
              <Sphere args={[0.3, 32, 32]} position={[-0.25, 0, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Sphere args={[0.3, 32, 32]} position={[0.25, 0, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Text position={[0, 0.6, 0]} fontSize={0.2} color="#888">H₂</Text>
            </group>

            {/* O2 molecule */}
            <group position={[2, 0, 0]}>
              <Sphere args={[0.35, 32, 32]} position={[-0.3, 0, 0]}>
                <meshStandardMaterial color="#EF4444" />
              </Sphere>
              <Sphere args={[0.35, 32, 32]} position={[0.3, 0, 0]}>
                <meshStandardMaterial color="#EF4444" />
              </Sphere>
              <Text position={[0, 0.7, 0]} fontSize={0.2} color="#888">O₂</Text>
            </group>

            {/* Arrow */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.15, 0.4, 8]} />
              <meshBasicMaterial color="#666" />
            </mesh>
          </group>
        )}

        {phase === 'transition' && (
          <group>
            {/* Activated complex - bonds breaking/forming */}
            <Sphere args={[0.3, 32, 32]} position={[-0.8, 0.3, 0]}>
              <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={2} />
            </Sphere>
            <Sphere args={[0.3, 32, 32]} position={[-0.3, -0.2, 0]}>
              <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={2} />
            </Sphere>
            <Sphere args={[0.35, 32, 32]} position={[0.4, 0, 0]}>
              <meshStandardMaterial color="#EF4444" emissive="#F59E0B" emissiveIntensity={2} />
            </Sphere>
            <Sphere args={[0.35, 32, 32]} position={[0.9, 0.2, 0]}>
              <meshStandardMaterial color="#EF4444" emissive="#F59E0B" emissiveIntensity={2} />
            </Sphere>

            {/* Energy glow */}
            <pointLight position={[0, 0, 0]} intensity={10} color="#F59E0B" distance={5} />
            <Text position={[0, 1, 0]} fontSize={0.2} color="#F59E0B">
              Ea = Activation Energy
            </Text>
          </group>
        )}

        {phase === 'products' && (
          <group>
            {/* H2O molecules */}
            <group position={[-1, 0, 0]}>
              <Sphere args={[0.35, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#EF4444" />
              </Sphere>
              <Sphere args={[0.25, 32, 32]} position={[-0.35, 0.25, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Sphere args={[0.25, 32, 32]} position={[0.35, 0.25, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Text position={[0, 0.8, 0]} fontSize={0.2} color="#888">H₂O</Text>
            </group>

            <group position={[1, 0, 0]}>
              <Sphere args={[0.35, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#EF4444" />
              </Sphere>
              <Sphere args={[0.25, 32, 32]} position={[-0.35, 0.25, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Sphere args={[0.25, 32, 32]} position={[0.35, 0.25, 0]}>
                <meshStandardMaterial color="#FFFFFF" />
              </Sphere>
              <Text position={[0, 0.8, 0]} fontSize={0.2} color="#888">H₂O</Text>
            </group>

            <Text position={[0, -0.8, 0]} fontSize={0.2} color="#22C55E">
              + Energy Released
            </Text>
          </group>
        )}
      </group>

      {/* Energy diagram */}
      <group position={[0, -2, 0]}>
        <Line points={energyPath} color="#888" lineWidth={2} />

        {/* Current state marker */}
        <mesh position={[
          phase === 'reactants' ? -2 : phase === 'transition' ? 0 : 2,
          phase === 'reactants' ? -0.5 : phase === 'transition' ? 1.5 : -1,
          0
        ]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={phase === 'transition' ? '#F59E0B' : '#22C55E'}
            emissive={phase === 'transition' ? '#F59E0B' : '#22C55E'}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Labels */}
        <Text position={[-2.5, -0.3, 0]} fontSize={0.15} color="#3B82F6">Reactants</Text>
        <Text position={[0, 2, 0]} fontSize={0.15} color="#F59E0B">Transition State</Text>
        <Text position={[2.5, -0.8, 0]} fontSize={0.15} color="#22C55E">Products</Text>

        {/* Axes */}
        <Line points={[[-3.5, -1.5, 0], [3.5, -1.5, 0]]} color="#444" lineWidth={1} />
        <Line points={[[-3.5, -1.5, 0], [-3.5, 2, 0]]} color="#444" lineWidth={1} />
        <Text position={[0, -1.9, 0]} fontSize={0.12} color="#666">Reaction Progress</Text>
        <Text position={[-4, 0.5, 0]} fontSize={0.12} color="#666" rotation={[0, 0, Math.PI / 2]}>Energy</Text>
      </group>

      {/* Formula */}
      <Text position={[0, -4.5, 0]} fontSize={0.25} color="#888">
        2H₂ + O₂ → 2H₂O + Energy
      </Text>
    </group>
  );
};

export default ChemicalReactionSimulation;
