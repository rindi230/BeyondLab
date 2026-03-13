import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
}

const AirPressureDemonstration = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const pistonRef = useRef<THREE.Mesh>(null);
  const [scenario, setScenario] = useState(0); // 0=piston, 1=vacuum, 2=balloon, 3=atmosphere
  const [pressure, setPressure] = useState(1.0); // Atmospheric pressure = 1.0 (101.325 kPa)
  const [temperature, setTemperature] = useState(293); // Kelvin (20°C)
  const timeRef = useRef(0);
  const collisionCountRef = useRef(0);
  const [measuredPressure, setMeasuredPressure] = useState(101.325);

  // Piston position (for compression scenario)
  const [pistonHeight, setPistonHeight] = useState(3);

  const particleCount = 300;
  const containerWidth = 5;
  const containerDepth = 5;
  const maxHeight = 8;

  // Physics constants
  const BOLTZMANN = 1.380649e-23; // J/K
  const AVOGADRO = 6.02214076e23;
  const GAS_CONSTANT = 8.314; // J/(mol·K)

  // Initialize air molecules (oxygen and nitrogen)
  const particles = useMemo<Particle[]>(() => {
    const pts: Particle[] = [];
    const initialHeight = pistonHeight;
    
    for (let i = 0; i < particleCount; i++) {
      // 78% Nitrogen (mass 28 u), 21% Oxygen (mass 32 u)
      const isNitrogen = Math.random() < 0.78;
      const mass = isNitrogen ? 28 : 32;
      
      // Random positions within container
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * containerWidth * 0.9,
        (Math.random() - 0.5) * initialHeight * 0.9,
        (Math.random() - 0.5) * containerDepth * 0.9
      );
      
      // Maxwell-Boltzmann velocity distribution
      const speed = getMaxwellBoltzmannSpeed(temperature, mass);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pts.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        ),
        mass: mass
      });
    }
    return pts;
  }, []);

  // Maxwell-Boltzmann speed distribution
  function getMaxwellBoltzmannSpeed(temp: number, molecularMass: number): number {
    // v_rms = sqrt(3RT/M) where M is in kg/mol
    const M = molecularMass / 1000; // Convert to kg/mol
    const v_rms = Math.sqrt((3 * GAS_CONSTANT * temp) / M);
    // Scale down for visualization (real speeds are ~500 m/s)
    return v_rms * 0.004;
  }

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Calculate pressure from particle collisions (Ideal Gas Law: PV = nRT)
  useEffect(() => {
    const volume = containerWidth * containerDepth * pistonHeight;
    const n = particleCount / AVOGADRO; // moles (approximate)
    const P = (particleCount * GAS_CONSTANT * temperature) / (volume * 1000); // in kPa
    setMeasuredPressure(P);
  }, [pistonHeight, temperature, particleCount]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    timeRef.current += delta;
    collisionCountRef.current = 0;

    const dt = Math.min(delta, 0.016); // Cap delta time
    const substeps = 3;
    const subDt = dt / substeps;

    for (let step = 0; step < substeps; step++) {
      particles.forEach((particle, i) => {
        // Apply gravity (very weak for gas molecules, but visible in low pressure)
        if (scenario === 1) { // Vacuum scenario
          particle.velocity.y -= 0.0001 * subDt * 60;
        }

        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(subDt * 60));

        // Current container bounds
        const topBound = scenario === 0 ? pistonHeight / 2 : maxHeight / 2;
        const bottomBound = -maxHeight / 2;
        const sideBound = containerWidth / 2;
        const depthBound = containerDepth / 2;

        // Wall collisions with realistic physics
        // X axis
        if (Math.abs(particle.position.x) > sideBound) {
          particle.position.x = Math.sign(particle.position.x) * sideBound;
          particle.velocity.x *= -0.99; // Small energy loss
          collisionCountRef.current++;
        }

        // Z axis
        if (Math.abs(particle.position.z) > depthBound) {
          particle.position.z = Math.sign(particle.position.z) * depthBound;
          particle.velocity.z *= -0.99;
          collisionCountRef.current++;
        }

        // Y axis (bottom)
        if (particle.position.y < bottomBound) {
          particle.position.y = bottomBound;
          particle.velocity.y *= -0.99;
          collisionCountRef.current++;
        }

        // Y axis (top - piston or ceiling)
        if (particle.position.y > topBound) {
          particle.position.y = topBound;
          particle.velocity.y *= -0.99;
          collisionCountRef.current++;
        }

        // Particle-particle collisions (simplified elastic collision)
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dist = particle.position.distanceTo(other.position);
          const minDist = 0.15;

          if (dist < minDist && dist > 0.001) {
            // Elastic collision
            const normal = other.position.clone().sub(particle.position).normalize();
            const relativeVelocity = particle.velocity.clone().sub(other.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            if (velocityAlongNormal > 0) continue; // Moving apart

            // Conservation of momentum and energy
            const totalMass = particle.mass + other.mass;
            const impulse = (2 * velocityAlongNormal) / totalMass;

            particle.velocity.sub(normal.clone().multiplyScalar(impulse * other.mass));
            other.velocity.add(normal.clone().multiplyScalar(impulse * particle.mass));

            // Separate particles
            const overlap = minDist - dist;
            const separation = normal.multiplyScalar(overlap / 2);
            particle.position.sub(separation);
            other.position.add(separation);
          }
        }

        // Update instance matrix
        dummy.position.copy(particle.position);
        
        // Much larger, more visible particles
        const baseSize = particle.mass === 28 ? 0.15 : 0.17;
        const size = baseSize * (1 + Math.sin(timeRef.current * 10 + i) * 0.15);
        dummy.scale.setScalar(size);
        
        dummy.updateMatrix();
        particlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
    }

    particlesRef.current.instanceMatrix.needsUpdate = true;

    // Update particle color based on temperature
    const mat = particlesRef.current.material as THREE.MeshStandardMaterial;
    const tempColor = getTemperatureColor(temperature);
    mat.color.copy(tempColor);
    mat.emissive.copy(tempColor).multiplyScalar(0.3);
  });

  // Piston animation for compression
  useEffect(() => {
    if (scenario === 0) {
      const interval = setInterval(() => {
        setPistonHeight(prev => {
          const target = 3 + Math.sin(timeRef.current * 0.5) * 1.5;
          return prev + (target - prev) * 0.1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scenario]);

  function getTemperatureColor(temp: number): THREE.Color {
    // Color based on temperature: blue (cold) -> white -> red (hot)
    const normalized = (temp - 200) / 400; // 200K to 600K range
    if (normalized < 0.5) {
      return new THREE.Color().lerpColors(
        new THREE.Color(0.2, 0.4, 1.0),
        new THREE.Color(0.9, 0.9, 0.9),
        normalized * 2
      );
    } else {
      return new THREE.Color().lerpColors(
        new THREE.Color(0.9, 0.9, 0.9),
        new THREE.Color(1.0, 0.3, 0.2),
        (normalized - 0.5) * 2
      );
    }
  }

  const getScenarioInfo = () => {
    switch(scenario) {
      case 0:
        return {
          title: "Piston Compression (Boyle's Law)",
          description: "As piston compresses gas, volume decreases and pressure increases. PV = constant at constant temperature.",
          formula: "P₁V₁ = P₂V₂"
        };
      case 1:
        return {
          title: "Vacuum Chamber",
          description: "Low pressure environment. Molecules move freely with minimal collisions, demonstrating kinetic theory.",
          formula: "P = nRT/V"
        };
      case 2:
        return {
          title: "Temperature & Pressure (Gay-Lussac's Law)",
          description: "Heating gas increases molecular kinetic energy, resulting in higher pressure at constant volume.",
          formula: "P₁/T₁ = P₂/T₂"
        };
      case 3:
        return {
          title: "Atmospheric Pressure Column",
          description: "Weight of air molecules creates atmospheric pressure (101.325 kPa at sea level).",
          formula: "P = ρgh"
        };
      default:
        return { title: "", description: "", formula: "" };
    }
  };

  const topBound = scenario === 0 ? pistonHeight / 2 : maxHeight / 2;

  return (
    <group>
      {/* Container base */}
      <mesh position={[0, -maxHeight / 2 - 0.1, 0]}>
        <boxGeometry args={[containerWidth + 0.5, 0.2, containerDepth + 0.5]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} transparent opacity={0.0} />
      </mesh>

      {/* Container walls (transparent) */}
      <group>
        {/* Front wall */}
        <mesh position={[0, 0, containerDepth / 2]}>
          <boxGeometry args={[containerWidth, maxHeight, 0.05]} />
          <meshPhysicalMaterial
            color="#66aaff"
            transparent
            opacity={0.0}
            metalness={0.2}
            roughness={0.1}
            transmission={1.0}
            thickness={0.5}
          />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 0, -containerDepth / 2]}>
          <boxGeometry args={[containerWidth, maxHeight, 0.05]} />
          <meshPhysicalMaterial
            color="#66aaff"
            transparent
            opacity={0.0}
            metalness={0.2}
            roughness={0.1}
            transmission={1.0}
            thickness={0.5}
          />
        </mesh>

        {/* Left wall */}
        <mesh position={[-containerWidth / 2, 0, 0]}>
          <boxGeometry args={[0.05, maxHeight, containerDepth]} />
          <meshPhysicalMaterial
            color="#66aaff"
            transparent
            opacity={0.0}
            metalness={0.2}
            roughness={0.1}
            transmission={1.0}
            thickness={0.5}
          />
        </mesh>

        {/* Right wall */}
        <mesh position={[containerWidth / 2, 0, 0]}>
          <boxGeometry args={[0.05, maxHeight, containerDepth]} />
          <meshPhysicalMaterial
            color="#66aaff"
            transparent
            opacity={0.0}
            metalness={0.2}
            roughness={0.1}
            transmission={1.0}
            thickness={0.5}
          />
        </mesh>
      </group>

      {/* Container edges for clarity */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(containerWidth, maxHeight, containerDepth)]} />
        <lineBasicMaterial color="#66aaff" opacity={0.0} transparent linewidth={2} />
      </lineSegments>

      {/* Piston (for scenario 0) */}
      {scenario === 0 && (
        <group position={[0, pistonHeight / 2, 0]}>
          <mesh ref={pistonRef}>
            <boxGeometry args={[containerWidth - 0.1, 0.2, containerDepth - 0.1]} />
            <meshStandardMaterial 
              color="#666666" 
              metalness={0.9} 
              roughness={0.2}
              emissive="#ff6600"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Piston rod */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Force arrow */}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.15, 0.3, 16]} />
            <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Air molecules */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={getTemperatureColor(temperature)}
          emissive={getTemperatureColor(temperature)}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.3}
        />
      </instancedMesh>

      {/* Pressure gauge visualization */}
      <Html position={[10, 2, 0]} center>
        <div className="bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 min-w-[200px]">
          <div className="text-white text-sm font-bold mb-2 text-center">Pressure Gauge</div>
          <div className="text-center">
            <div className="text-3xl font-mono text-cyan-400 mb-1">
              {measuredPressure.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">kPa</div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 text-center">
            {(measuredPressure / 101.325).toFixed(2)} atm
          </div>
          
          {/* Visual pressure bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
              style={{ width: `${Math.min((measuredPressure / 200) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Html>

      {/* Thermometer */}
      <Html position={[-10, 2, 0]} center>
        <div className="bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 min-w-[180px]">
          <div className="text-white text-sm font-bold mb-2 text-center">Temperature</div>
          <div className="text-center">
            <div className="text-3xl font-mono text-orange-400 mb-1">
              {(temperature - 273).toFixed(0)}°C
            </div>
            <div className="text-xs text-gray-400">{temperature.toFixed(0)} K</div>
          </div>
        </div>
      </Html>

      {/* Information panel - REMOVED FOR CLEANER VIEW */}

      {/* Control panel */}
      <Html position={[0, -8, 0]} center>
        <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/20">
          <div className="mb-4">
            <div className="text-white text-xs font-medium mb-2">Scenario</div>
            <div className="flex gap-2">
              {['Piston', 'Vacuum', 'Heating', 'Atmosphere'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setScenario(idx)}
                  className={`px-3 py-1.5 text-xs rounded transition-all ${
                    scenario === idx
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {scenario === 2 && (
            <div>
              <div className="text-white text-xs font-medium mb-2">
                Temperature: {(temperature - 273).toFixed(0)}°C
              </div>
              <input
                type="range"
                min="223"
                max="473"
                step="5"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 appearance-none bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>-50°C</span>
                <span>200°C</span>
              </div>
            </div>
          )}

          {scenario === 0 && (
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400">
                Volume: {(containerWidth * containerDepth * pistonHeight).toFixed(2)} m³
              </div>
            </div>
          )}

          <div className="mt-4 text-[10px] text-gray-500 text-center">
            Particle count: {particleCount} molecules
          </div>
        </div>
      </Html>

      {/* Physics info - moved far from simulation */}
      <Html position={[10, -8, 0]} center>
        <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded border border-blue-500/20">
          <p className="text-gray-300 text-[10px] text-center">
            Real-time simulation using kinetic molecular theory • Maxwell-Boltzmann distribution • Ideal gas law (PV=nRT)
          </p>
        </div>
      </Html>

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.6} />
      <pointLight position={[0, maxHeight, 0]} intensity={1.0} color="#88ccff" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[containerWidth, 0, 0]} intensity={0.5} color="#aaddff" />
      <pointLight position={[-containerWidth, 0, 0]} intensity={0.5} color="#aaddff" />
    </group>
  );
};

export default AirPressureDemonstration;