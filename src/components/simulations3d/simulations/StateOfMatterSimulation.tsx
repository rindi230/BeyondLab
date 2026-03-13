import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
}

const StateOfMatterSimulation = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const [temperature, setTemperature] = useState(0); // 0 = solid, 0.5 = liquid, 1 = gas
  const timeRef = useRef(0);

  const particleCount = 200;
  const containerSize = 3;

  // Initialize particles in a crystal lattice structure (solid state)
  const particles = useMemo<Particle[]>(() => {
    const pts: Particle[] = [];
    const gridSize = Math.ceil(Math.cbrt(particleCount));
    const spacing = (containerSize * 1.5) / gridSize;

    let count = 0;
    for (let x = 0; x < gridSize && count < particleCount; x++) {
      for (let y = 0; y < gridSize && count < particleCount; y++) {
        for (let z = 0; z < gridSize && count < particleCount; z++) {
          const pos = new THREE.Vector3(
            (x - gridSize / 2) * spacing,
            (y - gridSize / 2) * spacing,
            (z - gridSize / 2) * spacing
          );
          pts.push({
            position: pos.clone(),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.1,
              (Math.random() - 0.5) * 0.1,
              (Math.random() - 0.5) * 0.1
            ),
            basePosition: pos.clone()
          });
          count++;
        }
      }
    }
    return pts;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Get color based on temperature
  const getParticleColor = (temp: number) => {
    if (temp < 0.33) {
      // Solid - ice blue
      return new THREE.Color(0.4, 0.7, 1.0);
    } else if (temp < 0.66) {
      // Liquid - water blue
      return new THREE.Color(0.2, 0.5, 0.9);
    } else {
      // Gas - steam white/light blue
      const t = (temp - 0.66) / 0.34;
      return new THREE.Color(0.6 + t * 0.4, 0.7 + t * 0.3, 0.9 + t * 0.1);
    }
  };

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    timeRef.current += delta;

    const boundaryForce = 0.5;
    const containerBound = containerSize * (0.8 + temperature * 0.7);

    particles.forEach((particle, i) => {
      if (temperature < 0.33) {
        // SOLID STATE: Particles vibrate around fixed lattice positions
        const vibrationStrength = 0.05 + temperature * 0.15;
        const vibrationSpeed = 3 + temperature * 5;

        particle.position.x = particle.basePosition.x +
          Math.sin(timeRef.current * vibrationSpeed + i * 0.5) * vibrationStrength;
        particle.position.y = particle.basePosition.y +
          Math.cos(timeRef.current * vibrationSpeed + i * 0.7) * vibrationStrength;
        particle.position.z = particle.basePosition.z +
          Math.sin(timeRef.current * vibrationSpeed + i * 0.3) * vibrationStrength;

      } else if (temperature < 0.66) {
        // LIQUID STATE: Particles flow and slide past each other
        const liquidFactor = (temperature - 0.33) / 0.33;
        const flowSpeed = 0.5 + liquidFactor * 1.5;

        // Apply velocity with some randomness
        particle.velocity.x += (Math.random() - 0.5) * 0.02 * flowSpeed;
        particle.velocity.y += (Math.random() - 0.5) * 0.02 * flowSpeed - 0.005; // slight gravity
        particle.velocity.z += (Math.random() - 0.5) * 0.02 * flowSpeed;

        // Damping for liquid viscosity
        particle.velocity.multiplyScalar(0.98);

        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta * 60));

        // Keep in container with soft boundaries
        ['x', 'y', 'z'].forEach((axis) => {
          const a = axis as 'x' | 'y' | 'z';
          if (Math.abs(particle.position[a]) > containerBound) {
            particle.position[a] = Math.sign(particle.position[a]) * containerBound;
            particle.velocity[a] *= -0.5;
          }
        });

      } else {
        // GAS STATE: Particles move rapidly and fill the container
        const gasFactor = (temperature - 0.66) / 0.34;
        const gasSpeed = 2 + gasFactor * 4;

        // Random motion - Brownian-like
        particle.velocity.x += (Math.random() - 0.5) * 0.1 * gasSpeed;
        particle.velocity.y += (Math.random() - 0.5) * 0.1 * gasSpeed;
        particle.velocity.z += (Math.random() - 0.5) * 0.1 * gasSpeed;

        // Limit velocity
        const maxSpeed = 0.15 * gasSpeed;
        if (particle.velocity.length() > maxSpeed) {
          particle.velocity.normalize().multiplyScalar(maxSpeed);
        }

        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta * 60));

        // Bounce off container walls
        ['x', 'y', 'z'].forEach((axis) => {
          const a = axis as 'x' | 'y' | 'z';
          if (Math.abs(particle.position[a]) > containerBound) {
            particle.position[a] = Math.sign(particle.position[a]) * containerBound;
            particle.velocity[a] *= -0.9;
          }
        });
      }

      // Update instance matrix
      dummy.position.copy(particle.position);
      const scale = temperature < 0.33 ? 1 : (temperature < 0.66 ? 0.9 : 0.7 + Math.random() * 0.3);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);
    });

    particlesRef.current.instanceMatrix.needsUpdate = true;

    // Update material color
    const mat = particlesRef.current.material as THREE.MeshStandardMaterial;
    mat.color.copy(getParticleColor(temperature));
    mat.emissive.copy(getParticleColor(temperature)).multiplyScalar(0.2);
  });

  const getStateName = () => {
    if (temperature < 0.33) return "SOLID (Ice)";
    if (temperature < 0.66) return "LIQUID (Water)";
    return "GAS (Steam)";
  };

  const getTemperatureLabel = () => {
    if (temperature < 0.33) return `${Math.round(-20 + temperature * 60)}°C`;
    if (temperature < 0.66) return `${Math.round(20 + (temperature - 0.33) * 240)}°C`;
    return `${Math.round(100 + (temperature - 0.66) * 300)}°C`;
  };

  return (
    <group>
      {/* Container visualization */}
      <mesh>
        <boxGeometry args={[containerSize * 2.2, containerSize * 2.2, containerSize * 2.2]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Container edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(containerSize * 2.2, containerSize * 2.2, containerSize * 2.2)]} />
        <lineBasicMaterial color="#666666" transparent opacity={0.3} />
      </lineSegments>

      {/* Particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={getParticleColor(temperature)}
          emissive={getParticleColor(temperature)}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Heat source indicator */}
      <mesh position={[0, -containerSize - 0.5, 0]}>
        <boxGeometry args={[containerSize * 2, 0.3, containerSize * 2]} />
        <meshStandardMaterial
          color={new THREE.Color(1, 0.3 + temperature * 0.7, 0.1)}
          emissive={new THREE.Color(1, 0.2, 0)}
          emissiveIntensity={temperature * 0.5}
        />
      </mesh>

      {/* Labels */}
      <Text
        position={[0, containerSize + 1.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {getStateName()}
      </Text>

      <Text
        position={[0, containerSize + 1, 0]}
        fontSize={0.25}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {getTemperatureLabel()}
      </Text>

      {/* Temperature Control UI */}
      <Html position={[0, -containerSize - 1.5, 0]} center>
        <div className="flex flex-col items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
          <span className="text-white text-xs font-medium">Temperature Control</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-40 h-2 appearance-none bg-gradient-to-r from-blue-400 via-blue-600 to-red-500 rounded-full cursor-pointer"
          />
          <div className="flex justify-between w-full text-[10px] text-gray-400">
            <span>Solid</span>
            <span>Liquid</span>
            <span>Gas</span>
          </div>
        </div>
      </Html>

      {/* Molecular arrangement description */}
      <Html position={[containerSize + 2, 0, 0]} center>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 max-w-[140px]">
          <p className="text-white text-[10px] leading-relaxed">
            {temperature < 0.33 && "Molecules vibrate in fixed positions. Strong intermolecular bonds maintain crystal structure."}
            {temperature >= 0.33 && temperature < 0.66 && "Molecules slide past each other. Bonds are weaker, allowing flow while maintaining volume."}
            {temperature >= 0.66 && "Molecules move freely and rapidly. Minimal bonds allow gas to expand and fill container."}
          </p>
        </div>
      </Html>
    </group>
  );
};

export default StateOfMatterSimulation;
