import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Html, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

interface OrganelleProps {
  position: [number, number, number];
  name: string;
  description: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const Organelle = ({ position, name, description, color, isSelected, onClick, children }: OrganelleProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group scale={isSelected ? 1.2 : hovered ? 1.1 : 1}>
        {children}
      </group>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Hover label */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-center whitespace-nowrap">
            <p className="text-white text-xs font-bold">{name}</p>
            {isSelected && (
              <p className="text-gray-300 text-[10px] max-w-[150px]">{description}</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Nucleus component with nuclear envelope and nucleolus
const Nucleus = ({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) => {
  const nucleusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Organelle
      position={[0, 0, 0]}
      name="Nucleus"
      description="Contains DNA and controls cell activities. The 'brain' of the cell."
      color="#8844aa"
      isSelected={isSelected}
      onClick={onClick}
    >
      {/* Nuclear envelope (double membrane) */}
      <mesh ref={nucleusRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#6633aa"
          transparent
          opacity={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial
          color="#8855cc"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Nucleolus */}
      <mesh position={[0.2, 0.1, 0.3]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#aa66dd" roughness={0.5} />
      </mesh>

      {/* Chromatin (DNA strands) */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.8) * 0.4,
          Math.cos(i * 1.2) * 0.3,
          Math.sin(i * 0.5) * 0.4
        ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <torusGeometry args={[0.15, 0.03, 8, 16]} />
          <meshStandardMaterial color="#cc88ff" />
        </mesh>
      ))}

      {/* Nuclear pores */}
      {[...Array(12)].map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 12);
        const theta = Math.sqrt(12 * Math.PI) * phi;
        return (
          <mesh
            key={i}
            position={[
              0.78 * Math.sin(phi) * Math.cos(theta),
              0.78 * Math.sin(phi) * Math.sin(theta),
              0.78 * Math.cos(phi)
            ]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial color="#444466" />
          </mesh>
        );
      })}
    </Organelle>
  );
};

// Mitochondria with cristae
const Mitochondria = ({ position, isSelected, onClick }: { position: [number, number, number]; isSelected: boolean; onClick: () => void }) => {
  return (
    <Organelle
      position={position}
      name="Mitochondria"
      description="Powerhouse of the cell. Produces ATP through cellular respiration."
      color="#cc6644"
      isSelected={isSelected}
      onClick={onClick}
    >
      {/* Outer membrane */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color="#cc6644" transparent opacity={0.7} />
      </mesh>
      
      {/* Inner membrane with cristae folds */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
        <meshStandardMaterial color="#dd8866" />
      </mesh>
      
      {/* Cristae (internal folds) */}
      {[-0.1, 0, 0.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.015, 4, 16, Math.PI]} />
          <meshStandardMaterial color="#ffaa88" />
        </mesh>
      ))}
    </Organelle>
  );
};

// Endoplasmic Reticulum
const EndoplasmicReticulum = ({ position, isRough, isSelected, onClick }: { position: [number, number, number]; isRough: boolean; isSelected: boolean; onClick: () => void }) => {
  const tubePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 20; i++) {
      points.push(new THREE.Vector3(
        Math.sin(i * 0.5) * 0.3,
        (i - 10) * 0.05,
        Math.cos(i * 0.5) * 0.2
      ));
    }
    return points;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(tubePoints), [tubePoints]);

  return (
    <Organelle
      position={position}
      name={isRough ? "Rough ER" : "Smooth ER"}
      description={isRough 
        ? "Studded with ribosomes. Synthesizes proteins for export." 
        : "No ribosomes. Synthesizes lipids and detoxifies chemicals."
      }
      color={isRough ? "#5588aa" : "#66aa88"}
      isSelected={isSelected}
      onClick={onClick}
    >
      <mesh>
        <tubeGeometry args={[curve, 20, 0.04, 8, false]} />
        <meshStandardMaterial color={isRough ? "#5588aa" : "#66aa88"} transparent opacity={0.8} />
      </mesh>
      
      {/* Ribosomes on rough ER */}
      {isRough && [...Array(15)].map((_, i) => {
        const t = i / 15;
        const point = curve.getPoint(t);
        return (
          <mesh key={i} position={[point.x, point.y, point.z + 0.06]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#3366aa" />
          </mesh>
        );
      })}
    </Organelle>
  );
};

// Golgi Apparatus
const GolgiApparatus = ({ position, isSelected, onClick }: { position: [number, number, number]; isSelected: boolean; onClick: () => void }) => {
  return (
    <Organelle
      position={position}
      name="Golgi Apparatus"
      description="Packages and ships proteins. The cell's 'post office'."
      color="#aaaa44"
      isSelected={isSelected}
      onClick={onClick}
    >
      {/* Stacked cisternae */}
      {[-0.12, -0.06, 0, 0.06, 0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.02 + i * 0.005, 0.25 - i * 0.02, 4, 8]} />
          <meshStandardMaterial 
            color={`hsl(50, 60%, ${40 + i * 8}%)`}
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
      
      {/* Vesicles budding off */}
      {[[0.2, 0.1, 0], [-0.2, -0.05, 0.05], [0.15, -0.12, -0.05]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#cccc66" />
        </mesh>
      ))}
    </Organelle>
  );
};

// Lysosome
const Lysosome = ({ position, isSelected, onClick }: { position: [number, number, number]; isSelected: boolean; onClick: () => void }) => {
  return (
    <Organelle
      position={position}
      name="Lysosome"
      description="Contains digestive enzymes. Breaks down waste and foreign materials."
      color="#aa4444"
      isSelected={isSelected}
      onClick={onClick}
    >
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#aa4444" transparent opacity={0.7} />
      </mesh>
      {/* Enzymes inside */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.5) * 0.08,
          Math.cos(i * 1.2) * 0.08,
          Math.sin(i * 0.8) * 0.08
        ]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ff6666" />
        </mesh>
      ))}
    </Organelle>
  );
};

// Ribosome
const Ribosome = ({ position, isSelected, onClick }: { position: [number, number, number]; isSelected: boolean; onClick: () => void }) => {
  return (
    <Organelle
      position={position}
      name="Ribosome"
      description="Protein factories. Read mRNA and assemble amino acids into proteins."
      color="#4466aa"
      isSelected={isSelected}
      onClick={onClick}
    >
      {/* Large subunit */}
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#4466aa" />
      </mesh>
      {/* Small subunit */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#6688cc" />
      </mesh>
    </Organelle>
  );
};

const CellStructureSimulation = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedOrganelle, setSelectedOrganelle] = useState<string | null>(null);
  const cellRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Animate cell membrane
  useFrame((state) => {
    if (cellRef.current) {
      cellRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    
    // Update camera zoom
    const targetZ = 8 / zoomLevel;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
  });

  const handleOrganelleClick = (name: string) => {
    setSelectedOrganelle(selectedOrganelle === name ? null : name);
  };

  return (
    <group ref={cellRef}>
      {/* Cell membrane (phospholipid bilayer representation) */}
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color="#88aacc"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          roughness={0.3}
        />
      </mesh>
      
      {/* Membrane proteins */}
      {[...Array(20)].map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 20);
        const theta = Math.sqrt(20 * Math.PI) * phi;
        return (
          <mesh
            key={i}
            position={[
              2.95 * Math.sin(phi) * Math.cos(theta),
              2.95 * Math.sin(phi) * Math.sin(theta),
              2.95 * Math.cos(phi)
            ]}
          >
            <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
            <meshStandardMaterial color="#6688aa" />
          </mesh>
        );
      })}

      {/* Cytoplasm (slight color tint) */}
      <mesh>
        <sphereGeometry args={[2.9, 32, 32]} />
        <meshStandardMaterial
          color="#aaddff"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Organelles */}
      <Nucleus 
        isSelected={selectedOrganelle === "Nucleus"} 
        onClick={() => handleOrganelleClick("Nucleus")} 
      />
      
      <Mitochondria 
        position={[1.5, 0.5, 0.8]} 
        isSelected={selectedOrganelle === "Mitochondria1"} 
        onClick={() => handleOrganelleClick("Mitochondria1")} 
      />
      <Mitochondria 
        position={[-1.2, -0.8, 1]} 
        isSelected={selectedOrganelle === "Mitochondria2"} 
        onClick={() => handleOrganelleClick("Mitochondria2")} 
      />
      <Mitochondria 
        position={[0.8, -1.2, -0.5]} 
        isSelected={selectedOrganelle === "Mitochondria3"} 
        onClick={() => handleOrganelleClick("Mitochondria3")} 
      />

      <EndoplasmicReticulum 
        position={[1.8, 0, -0.5]} 
        isRough={true}
        isSelected={selectedOrganelle === "RoughER"} 
        onClick={() => handleOrganelleClick("RoughER")} 
      />
      <EndoplasmicReticulum 
        position={[-1.5, 0.3, -0.8]} 
        isRough={false}
        isSelected={selectedOrganelle === "SmoothER"} 
        onClick={() => handleOrganelleClick("SmoothER")} 
      />

      <GolgiApparatus 
        position={[-1.8, -0.3, 0.5]} 
        isSelected={selectedOrganelle === "Golgi"} 
        onClick={() => handleOrganelleClick("Golgi")} 
      />

      <Lysosome 
        position={[0.5, 1.5, 0.3]} 
        isSelected={selectedOrganelle === "Lysosome1"} 
        onClick={() => handleOrganelleClick("Lysosome1")} 
      />
      <Lysosome 
        position={[-0.8, 1.2, -0.5]} 
        isSelected={selectedOrganelle === "Lysosome2"} 
        onClick={() => handleOrganelleClick("Lysosome2")} 
      />

      {/* Free ribosomes */}
      {[[1, -0.5, 1.5], [-0.5, 1, 1.2], [0.3, -1.5, 0.8], [-1, -1, 1]].map((pos, i) => (
        <Ribosome 
          key={i}
          position={pos as [number, number, number]} 
          isSelected={selectedOrganelle === `Ribosome${i}`} 
          onClick={() => handleOrganelleClick(`Ribosome${i}`)} 
        />
      ))}

      {/* Cytoskeleton (microtubules) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[0, 0, 0]} rotation={[0, angle, Math.PI / 6]}>
            <cylinderGeometry args={[0.015, 0.015, 5, 8]} />
            <meshStandardMaterial color="#666688" transparent opacity={0.3} />
          </mesh>
        );
      })}

      {/* Title */}
      <Text
        position={[0, 3.8, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        Animal Cell Structure
      </Text>

      <Text
        position={[0, 3.4, 0]}
        fontSize={0.2}
        color="#888888"
        anchorX="center"
      >
        Click on organelles to learn more
      </Text>

      {/* Zoom Control */}
      <Html position={[0, -4, 0]} center>
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-white text-xs">Zoom</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-32 h-2 appearance-none bg-gray-700 rounded-full cursor-pointer"
            />
            <span className="text-white text-xs w-10">{(zoomLevel * 100).toFixed(0)}%</span>
          </div>
          <p className="text-gray-400 text-[10px] mt-2 text-center">
            Drag to rotate • Click organelles for details
          </p>
        </div>
      </Html>

      {/* Additional lighting */}
      <pointLight position={[3, 3, 3]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-3, -3, 3]} intensity={0.3} color="#88aaff" />
    </group>
  );
};

export default CellStructureSimulation;
