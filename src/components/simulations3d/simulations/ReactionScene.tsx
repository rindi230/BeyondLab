import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Trail, Float, Stars, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import { getReaction } from '../utils/ReactionData';
import { ElementData } from '../utils/ElementData';

// --- Shaders ---

const ELECTRON_FIELD_SHADER = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#44FFFF') },
    },
    vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    uniform vec3 uColor;

    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      float dist = length(vPosition);
      
      // Volumetric cloud effect with exponential decay
      float field = exp(-dist * 1.5); 
      
      // Dynamic quantum fluctuations
      float n1 = noise(vPosition * 2.0 + uTime * 0.2);
      float n2 = noise(vPosition * 5.0 - uTime * 0.5);
      float interference = (n1 * 0.5 + n2 * 0.5);
      
      // Fresnel effect for soft edges
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      
      float alpha = field * (0.2 + interference * 0.4) + fresnel * 0.1;
      
      // Color variation based on density
      vec3 finalColor = mix(uColor, vec3(1.0), fresnel * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// --- Components ---

const Nucleus = ({ count, color }: { count: number, color: string }) => {
    const groupRef = useRef<THREE.Group>(null);
    const spheres = useMemo(() => {
        const s = [];
        const protonColor = new THREE.Color(color).lerp(new THREE.Color('white'), 0.3);
        const neutronColor = new THREE.Color('#444444').lerp(new THREE.Color(color), 0.1);

        for (let i = 0; i < Math.min(count, 48); i++) {
            const phi = Math.acos(-1 + (2 * i) / Math.min(count, 48));
            const theta = Math.sqrt(Math.min(count, 48) * Math.PI) * phi;
            const r = 0.22;
            s.push({
                pos: [
                    Math.cos(theta) * Math.sin(phi) * r,
                    Math.sin(theta) * Math.sin(phi) * r,
                    Math.cos(phi) * r
                ] as [number, number, number],
                isProton: i % 2 === 0,
                color: i % 2 === 0 ? protonColor : neutronColor
            });
        }
        return s;
    }, [count, color]);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle quantum "vibration"
            const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
            groupRef.current.scale.set(s, s, s);
            groupRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={groupRef}>
            {spheres.map((s, i) => (
                <Sphere key={i} position={s.pos} args={[0.12, 24, 24]}>
                    <meshStandardMaterial
                        color={s.color}
                        roughness={0.1}
                        metalness={0.9}
                        emissive={s.isProton ? s.color : 'black'}
                        emissiveIntensity={s.isProton ? 0.5 : 0}
                    />
                </Sphere>
            ))}
            <pointLight intensity={2} color={color} distance={3} />
        </group>
    );
};

const Atom = ({ element, position, scale = 1, color }: { element: ElementData, position: [number, number, number], scale?: number, color?: string }) => {
    const groupRef = useRef<THREE.Group>(null);
    const valenceRef = useRef<THREE.Group>(null);
    const atomColor = color || element.color || '#FFFFFF';

    const fieldMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            ...THREE.UniformsUtils.clone(ELECTRON_FIELD_SHADER.uniforms),
            uColor: { value: new THREE.Color(atomColor) }
        },
        vertexShader: ELECTRON_FIELD_SHADER.vertexShader,
        fragmentShader: ELECTRON_FIELD_SHADER.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [atomColor]);

    const orbitalRings = useMemo(() => {
        const rings = [];
        const shellCount = Math.ceil(element.atomicNumber / 10) + 1;
        for (let i = 1; i <= shellCount; i++) {
            rings.push({
                radius: 1.0 + i * 0.4,
                opacity: 0.15 / i,
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number]
            });
        }
        return rings;
    }, [element.atomicNumber]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        fieldMaterial.uniforms.uTime.value = time;
        if (valenceRef.current) {
            valenceRef.current.rotation.y = time * 2;
            valenceRef.current.rotation.x = time * 0.5;
        }
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <Nucleus count={element.atomicNumber} color={atomColor} />

            {/* Orbital Shell Visuals */}
            {orbitalRings.map((ring, i) => (
                <group key={i} rotation={ring.rotation}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[ring.radius, 0.005, 16, 100]} />
                        <meshBasicMaterial color={atomColor} transparent opacity={ring.opacity} />
                    </mesh>
                </group>
            ))}

            {/* Valence Electron Highlights */}
            <group ref={valenceRef}>
                {[0, 1, 2].map((i) => (
                    <mesh key={i} position={[Math.cos(i * 2) * 1.5, Math.sin(i * 2) * 1.5, 0]}>
                        <sphereGeometry args={[0.04, 16, 16]} />
                        <meshStandardMaterial color={atomColor} emissive={atomColor} emissiveIntensity={2} />
                    </mesh>
                ))}
            </group>

            {/* Volumetric Electron Cloud */}
            <Sphere args={[1.8, 48, 48]}>
                <primitive object={fieldMaterial} attach="material" />
            </Sphere>

            {/* Symbols */}
            <Text position={[0, 0, 2.0]} fontSize={0.45} color="white" fontStyle="italic">
                {element.symbol}
            </Text>
        </group>
    );
};

const IonicReaction = ({ e1, e2 }: { e1: ElementData, e2: ElementData }) => {
    const [phase, setPhase] = useState<'approaching' | 'impact' | 'lattice'>('approaching');
    const lightRef = useRef<THREE.PointLight>(null);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('impact'), 2000);
        const t2 = setTimeout(() => setPhase('lattice'), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    useFrame((state) => {
        if (lightRef.current && phase === 'impact') {
            lightRef.current.intensity = Math.sin(state.clock.elapsedTime * 50) * 100 + 100;
        }
    });

    return (
        <group>
            {phase === 'approaching' && (
                <>
                    <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Atom element={e1} position={[-4, 0, 0]} />
                    </Float>
                    <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Atom element={e2} position={[4, 0, 0]} />
                    </Float>
                </>
            )}

            {phase === 'impact' && (
                <>
                    <pointLight ref={lightRef} color="#FFFF00" />
                    <Sparkles count={200} scale={5} size={10} speed={4} color="#FFFF00" />
                </>
            )}

            {phase === 'lattice' && (
                <group rotation={[0.5, 0.5, 0]}>
                    <Sparkles count={100} scale={4} size={2} speed={0.4} opacity={0.5} color="#FFFF00" />
                    {/* Simplified Lattice */}
                    {[[-1, -1, -1], [1, 1, 1], [1, -1, -1], [-1, 1, 1]].map((pos, i) => (
                        <Atom key={i} element={i % 2 === 0 ? e1 : e2} position={pos as [number, number, number]} scale={0.7} />
                    ))}
                    {/* Lattice connections */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <boxGeometry args={[0.05, 3, 0.05]} />
                        <meshBasicMaterial color="#FFFF00" transparent opacity={0.2} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const CovalentReaction = ({ e1, e2 }: { e1: ElementData, e2: ElementData }) => {
    const [bonded, setBonded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setBonded(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <group>
            {!bonded ? (
                <>
                    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                        <Atom element={e1} position={[-3, 0, 0]} />
                    </Float>
                    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                        <Atom element={e2} position={[3, 0, 0]} />
                    </Float>
                </>
            ) : (
                <group>
                    <Sparkles count={150} scale={3} size={5} speed={1} opacity={0.8} color="#00FFFF" />
                    <group>
                        <Atom element={e2} position={[0, 0, 0]} scale={1.2} />
                        <Atom element={e1} position={[1.5, -1, 0]} scale={0.8} />
                        <Atom element={e1} position={[-1.5, -1, 0]} scale={0.8} />
                        {/* Covalent Bonds - Energy Beams */}
                        <mesh position={[0.75, -0.5, 0]} rotation={[0, 0, -0.6]}>
                            <cylinderGeometry args={[0.1, 0.1, 1.8]} />
                            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} transparent opacity={0.6} />
                        </mesh>
                        <mesh position={[-0.75, -0.5, 0]} rotation={[0, 0, 0.6]}>
                            <cylinderGeometry args={[0.1, 0.1, 1.8]} />
                            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} transparent opacity={0.6} />
                        </mesh>
                    </group>
                </group>
            )}
        </group>
    );
}

const ReactionScene = ({ element1, element2, onBack }: { element1: ElementData, element2: ElementData, onBack: () => void }) => {
    const reaction = getReaction(element1, element2);

    const renderReaction = () => {
        if (!reaction || reaction.type === 'none') {
            return (
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Atom element={element1} position={[-2, 0, 0]} />
                    <Atom element={element2} position={[2, 0, 0]} />
                    <Text position={[0, -3, 0]} fontSize={0.3} color="#AAA">No strong reaction observed</Text>
                </Float>
            );
        }

        switch (reaction.type) {
            case 'ionic': return <IonicReaction e1={element1} e2={element2} />;
            case 'covalent':
            case 'combustion': return <CovalentReaction e1={element1} e2={element2} />;
            default: return null;
        }
    };

    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {renderReaction()}

            {/* HUD Overlay */}
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-between p-12">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-bold tracking-tighter text-white animate-in slide-in-from-top-10 duration-700">
                            {reaction ? reaction.equation : `${element1.name} + ${element2.name}`}
                        </h2>
                        {reaction && (
                            <p className="max-w-xl text-white/60 text-sm font-light tracking-wide leading-relaxed animate-in fade-in duration-1000">
                                {reaction.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onBack}
                        style={{ pointerEvents: 'auto' }}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-white text-xs font-bold tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95"
                    >
                        Back to Laboratory
                    </button>
                </div>
            </Html>
        </group>
    );
};

export default ReactionScene;
