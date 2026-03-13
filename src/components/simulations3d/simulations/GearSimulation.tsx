import { useRef, useMemo, useState } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { Text, Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface GearProps {
  position: [number, number, number];
  teeth: number;
  radius: number;
  thickness: number;
  rotationSpeed: number;
  rotationDirection: number;
  color: string;
  isDriver?: boolean;
  energyLevel: number;
}

const Gear = ({ position, teeth, radius, thickness, rotationSpeed, rotationDirection, color, isDriver, energyLevel }: GearProps) => {
  const gearRef = useRef<THREE.Group>(null);
  const rotationRef = useRef(0);

  // Create gear shape
  const gearShape = useMemo(() => {
    const shape = new THREE.Shape();
    const innerRadius = radius * 0.3;
    const toothHeight = radius * 0.2;
    const toothWidth = (2 * Math.PI) / teeth / 2;

    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
      const midAngle = angle + toothWidth / 2;
      const midAngle2 = angle + toothWidth * 1.5;

      const outerR = radius + toothHeight;
      
      if (i === 0) {
        shape.moveTo(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        );
      }

      // Tooth up
      shape.lineTo(
        Math.cos(midAngle - toothWidth * 0.3) * radius,
        Math.sin(midAngle - toothWidth * 0.3) * radius
      );
      shape.lineTo(
        Math.cos(midAngle - toothWidth * 0.2) * outerR,
        Math.sin(midAngle - toothWidth * 0.2) * outerR
      );
      shape.lineTo(
        Math.cos(midAngle + toothWidth * 0.2) * outerR,
        Math.sin(midAngle + toothWidth * 0.2) * outerR
      );
      shape.lineTo(
        Math.cos(midAngle + toothWidth * 0.3) * radius,
        Math.sin(midAngle + toothWidth * 0.3) * radius
      );
      
      // Valley
      shape.lineTo(
        Math.cos(midAngle2) * radius,
        Math.sin(midAngle2) * radius
      );
    }

    shape.closePath();

    // Add center hole
    const holePath = new THREE.Path();
    holePath.absellipse(0, 0, innerRadius, innerRadius, 0, Math.PI * 2, true, 0);
    shape.holes.push(holePath);

    return shape;
  }, [teeth, radius]);

  useFrame((state, delta) => {
    if (!gearRef.current) return;
    rotationRef.current += rotationSpeed * rotationDirection * delta;
    gearRef.current.rotation.z = rotationRef.current;
  });

  const emissiveIntensity = energyLevel * 0.3;

  return (
    <group position={position}>
      <group ref={gearRef}>
        {/* Main gear body */}
        <mesh castShadow receiveShadow>
          <extrudeGeometry 
            args={[gearShape, { 
              depth: thickness, 
              bevelEnabled: true, 
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 3
            }]} 
          />
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>

        {/* Center hub */}
        <mesh position={[0, 0, thickness / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.15, radius * 0.15, thickness + 0.1, 32]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Center axle */}
        <mesh position={[0, 0, thickness / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.08, radius * 0.08, thickness + 0.5, 16]} />
          <meshStandardMaterial color="#555" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Spokes for larger gears */}
        {radius > 0.8 && [0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0, thickness / 2]} rotation={[0, 0, (i * Math.PI) / 2]}>
            <boxGeometry args={[radius * 0.5, radius * 0.08, thickness * 0.5]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Driver indicator */}
      {isDriver && (
        <mesh position={[0, 0, thickness + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.1, 0.3, 6]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff3300" 
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

const EnergyArrow = ({ start, end, intensity }: { start: [number, number, number]; end: [number, number, number]; intensity: number }) => {
  const lineRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    if (lineRef.current) {
      const opacity = 0.3 + Math.sin(timeRef.current * 5) * 0.2 * intensity;
      lineRef.current.children.forEach(child => {
        if ((child as THREE.Mesh).material) {
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      });
    }
  });

  return (
    <group ref={lineRef}>
      <Line
        points={points}
        color="#ffaa00"
        lineWidth={2}
        transparent
        opacity={0.5}
      />
    </group>
  );
};

const GearSimulation = () => {
  const [inputSpeed, setInputSpeed] = useState(1);
  const baseSpeed = 2;

  // Gear train configuration (realistic gear ratios)
  const gears = useMemo(() => [
    { teeth: 12, radius: 0.6, x: -2.5, y: 0, isDriver: true, color: "#cc4444" },
    { teeth: 24, radius: 1.2, x: -0.8, y: 0, isDriver: false, color: "#44cc44" },
    { teeth: 16, radius: 0.8, x: 1.2, y: 0, isDriver: false, color: "#4444cc" },
    { teeth: 32, radius: 1.6, x: 3.6, y: 0, isDriver: false, color: "#cc44cc" },
  ], []);

  // Calculate rotation speeds based on gear ratios
  const gearSpeeds = useMemo(() => {
    const speeds = [baseSpeed * inputSpeed]; // Driver speed
    for (let i = 1; i < gears.length; i++) {
      const ratio = gears[i - 1].teeth / gears[i].teeth;
      speeds.push(speeds[i - 1] * ratio);
    }
    return speeds;
  }, [gears, inputSpeed]);

  // Calculate energy levels (diminishing through the train due to friction)
  const energyLevels = useMemo(() => {
    const efficiency = 0.95; // 95% efficiency per gear mesh
    return gears.map((_, i) => Math.pow(efficiency, i));
  }, [gears]);

  // Calculate torque (inverse of speed for constant power)
  const torques = useMemo(() => {
    return gearSpeeds.map((speed, i) => (gearSpeeds[0] / speed) * energyLevels[i]);
  }, [gearSpeeds, energyLevels]);

  return (
    <group>
      {/* Background plate */}
      <mesh position={[0.5, 0, -0.5]} receiveShadow>
        <boxGeometry args={[10, 6, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Gears */}
      {gears.map((gear, i) => (
        <Gear
          key={i}
          position={[gear.x, gear.y, 0]}
          teeth={gear.teeth}
          radius={gear.radius}
          thickness={0.3}
          rotationSpeed={gearSpeeds[i]}
          rotationDirection={i % 2 === 0 ? 1 : -1}
          color={gear.color}
          isDriver={gear.isDriver}
          energyLevel={energyLevels[i]}
        />
      ))}

      {/* Energy flow arrows */}
      {gears.slice(0, -1).map((gear, i) => (
        <EnergyArrow
          key={i}
          start={[gear.x + gear.radius * 0.5, 1.5, 0.5]}
          end={[gears[i + 1].x - gears[i + 1].radius * 0.5, 1.5, 0.5]}
          intensity={energyLevels[i]}
        />
      ))}

      {/* Labels for each gear */}
      {gears.map((gear, i) => (
        <group key={`label-${i}`}>
          <Text
            position={[gear.x, -gear.radius - 0.5, 0.5]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
          >
            {`${gear.teeth}T`}
          </Text>
          <Text
            position={[gear.x, -gear.radius - 0.8, 0.5]}
            fontSize={0.15}
            color="#888888"
            anchorX="center"
          >
            {`ω: ${gearSpeeds[i].toFixed(2)} rad/s`}
          </Text>
          <Text
            position={[gear.x, -gear.radius - 1.05, 0.5]}
            fontSize={0.15}
            color="#ffaa00"
            anchorX="center"
          >
            {`τ: ${torques[i].toFixed(2)}x`}
          </Text>
        </group>
      ))}

      {/* Title */}
      <Text
        position={[0.5, 2.5, 0.5]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
      >
        Energy Transfer in Gear Train
      </Text>

      {/* Physics explanation */}
      <Html position={[0.5, -2.8, 0]} center>
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10 max-w-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs">Input Speed</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={inputSpeed}
                onChange={(e) => setInputSpeed(parseFloat(e.target.value))}
                className="w-32 h-2 appearance-none bg-gray-700 rounded-full cursor-pointer"
              />
              <span className="text-white text-xs w-12">{inputSpeed.toFixed(1)}x</span>
            </div>
            <div className="text-[10px] text-gray-300 leading-relaxed">
              <p><span className="text-yellow-400">⚡ Power:</span> P = τ × ω (constant through train)</p>
              <p><span className="text-green-400">🔄 Gear Ratio:</span> Larger gear = slower speed, higher torque</p>
              <p><span className="text-red-400">🔥 Efficiency:</span> ~5% energy lost per mesh (friction/heat)</p>
            </div>
          </div>
        </div>
      </Html>

      {/* Additional lighting for metallic effect */}
      <pointLight position={[0, 3, 3]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color="#4488ff" />
    </group>
  );
};

export default GearSimulation;
