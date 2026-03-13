import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

type MitosisPhase = 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'cytokinesis';

export const CellDivisionSimulation = () => {
  const [phase, setPhase] = useState<MitosisPhase>('interphase');
  const cellRef = useRef<THREE.Group>(null);
  const chromosomesRef = useRef<THREE.Group>(null);

  // Cycle through phases
  useEffect(() => {
    const phases: MitosisPhase[] = ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (cellRef.current) {
      // Cell shape changes during division
      if (phase === 'cytokinesis') {
        cellRef.current.scale.x = 1.5;
        cellRef.current.scale.z = 0.7;
      } else {
        cellRef.current.scale.x = 1;
        cellRef.current.scale.z = 1;
      }
    }

    if (chromosomesRef.current) {
      // Animate chromosomes based on phase
      chromosomesRef.current.children.forEach((chrom, i) => {
        const offset = i * 0.5;
        
        if (phase === 'interphase') {
          // Dispersed chromatin
          chrom.position.set(
            Math.sin(time + offset) * 0.5,
            Math.cos(time * 0.7 + offset) * 0.5,
            Math.sin(time * 0.5 + offset) * 0.3
          );
          chrom.scale.setScalar(0.3);
        } else if (phase === 'prophase') {
          // Condensing
          chrom.position.set(
            Math.sin(offset) * 0.4,
            Math.cos(offset) * 0.4,
            0
          );
          chrom.scale.setScalar(0.5);
        } else if (phase === 'metaphase') {
          // Line up at center
          chrom.position.set(0, (i - 2) * 0.3, 0);
          chrom.scale.setScalar(0.6);
        } else if (phase === 'anaphase') {
          // Pull apart
          const dir = i % 2 === 0 ? 1 : -1;
          chrom.position.set(dir * 0.8, (Math.floor(i / 2) - 1) * 0.3, 0);
          chrom.scale.setScalar(0.5);
        } else if (phase === 'telophase' || phase === 'cytokinesis') {
          // Separate into two groups
          const dir = i % 2 === 0 ? 1.2 : -1.2;
          chrom.position.set(dir, (Math.floor(i / 2) - 1) * 0.25, 0);
          chrom.scale.setScalar(0.4);
        }
      });
    }
  });

  const getPhaseColor = () => {
    const colors: Record<MitosisPhase, string> = {
      interphase: '#22C55E',
      prophase: '#3B82F6',
      metaphase: '#8B5CF6',
      anaphase: '#F59E0B',
      telophase: '#EF4444',
      cytokinesis: '#EC4899',
    };
    return colors[phase];
  };

  return (
    <group>
      <Text position={[0, 4, 0]} fontSize={0.4} color="#888">
        Cell Division (Mitosis)
      </Text>
      <Text position={[0, 3.4, 0]} fontSize={0.3} color={getPhaseColor()}>
        {phase.charAt(0).toUpperCase() + phase.slice(1)}
      </Text>

      {/* Cell membrane */}
      <group ref={cellRef}>
        <Sphere args={[1.8, 32, 32]}>
          <meshStandardMaterial 
            color="#88CC88"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Sphere>
        
        {/* Cell membrane outline */}
        <Sphere args={[1.82, 32, 32]}>
          <meshBasicMaterial 
            color="#22C55E"
            transparent
            opacity={0.5}
            wireframe
          />
        </Sphere>

        {/* Nucleus (visible in early phases) */}
        {(phase === 'interphase' || phase === 'prophase') && (
          <Sphere args={[0.8, 32, 32]}>
            <meshStandardMaterial 
              color="#4B5563"
              transparent
              opacity={0.4}
            />
          </Sphere>
        )}

        {/* Chromosomes */}
        <group ref={chromosomesRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i}>
              <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
              <meshStandardMaterial 
                color="#3B82F6"
                emissive="#3B82F6"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Spindle fibers (metaphase, anaphase) */}
        {(phase === 'metaphase' || phase === 'anaphase') && (
          <group>
            {[-1, 1].map((dir) => (
              <group key={dir}>
                {[0, 1, 2].map((i) => (
                  <mesh 
                    key={i} 
                    position={[dir * 1.5, 0, 0]}
                    rotation={[0, 0, dir > 0 ? -Math.PI / 6 + i * Math.PI / 6 : Math.PI / 6 - i * Math.PI / 6]}
                  >
                    <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
                    <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}

        {/* Centrioles */}
        {(phase === 'metaphase' || phase === 'anaphase' || phase === 'telophase') && (
          <group>
            <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#EF4444" />
            </mesh>
            <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#EF4444" />
            </mesh>
          </group>
        )}

        {/* Cleavage furrow (cytokinesis) */}
        {phase === 'cytokinesis' && (
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.7, 0.05, 8, 32]} />
            <meshStandardMaterial color="#EC4899" />
          </mesh>
        )}
      </group>

      {/* Phase descriptions */}
      <group position={[3.5, 1, 0]}>
        <Text position={[0, 1.5, 0]} fontSize={0.15} color={phase === 'interphase' ? '#22C55E' : '#444'} anchorX="left">
          Interphase: DNA replication
        </Text>
        <Text position={[0, 1.1, 0]} fontSize={0.15} color={phase === 'prophase' ? '#3B82F6' : '#444'} anchorX="left">
          Prophase: Chromosomes condense
        </Text>
        <Text position={[0, 0.7, 0]} fontSize={0.15} color={phase === 'metaphase' ? '#8B5CF6' : '#444'} anchorX="left">
          Metaphase: Align at center
        </Text>
        <Text position={[0, 0.3, 0]} fontSize={0.15} color={phase === 'anaphase' ? '#F59E0B' : '#444'} anchorX="left">
          Anaphase: Chromatids separate
        </Text>
        <Text position={[0, -0.1, 0]} fontSize={0.15} color={phase === 'telophase' ? '#EF4444' : '#444'} anchorX="left">
          Telophase: Nuclei reform
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.15} color={phase === 'cytokinesis' ? '#EC4899' : '#444'} anchorX="left">
          Cytokinesis: Cell divides
        </Text>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default CellDivisionSimulation;
