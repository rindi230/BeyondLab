import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, TiltShift } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- Types & Data ---

type BodySystem = 'skin' | 'skeletal' | 'circulatory' | 'nervous' | 'organs';

interface OrganInfo {
    id: string;
    name: string;
    description: string;
    system: BodySystem;
}

const organData: Record<string, OrganInfo> = {
    'brain': { id: 'brain', name: 'Brain', description: 'The command center. Consumes 20% of body energy.', system: 'nervous' },
    'heart': { id: 'heart', name: 'Heart', description: 'Muscular organ pumping blood through blood vessels.', system: 'circulatory' },
    'lungs': { id: 'lungs', name: 'Lungs', description: 'Pair of organs for respiration and oxygen intake.', system: 'organs' },
    'stomach': { id: 'stomach', name: 'Stomach', description: 'Muscular organ that digests food with acid.', system: 'organs' },
    'liver': { id: 'liver', name: 'Liver', description: 'Detoxifies chemicals and secretes bile.', system: 'organs' },
    'intestines': { id: 'intestines', name: 'Small Intestine', description: 'Long tube where 90% of digestion occurs.', system: 'organs' },
    'kidneys': { id: 'kidneys', name: 'Kidneys', description: 'Filters blood to produce urine.', system: 'organs' },
    'bladder': { id: 'bladder', name: 'Bladder', description: 'Stores urine before disposal.', system: 'organs' },
};

// --- Procedural Texture Generation ---

const useFleshTexture = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Base Color
            ctx.fillStyle = '#804040';
            ctx.fillRect(0, 0, 512, 512);

            // Noise / Veins
            for (let i = 0; i < 2000; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const r = Math.random() * 2 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = Math.random() > 0.5 ? '#a05050' : '#603030';
                ctx.fill();
            }

            // Vein Lines
            ctx.strokeStyle = '#502020';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
                ctx.moveTo(Math.random() * 512, Math.random() * 512);
                ctx.bezierCurveTo(Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512);
            }
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }, []);
};

const useBoneTexture = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#E8E8D0';
            ctx.fillRect(0, 0, 512, 512);
            // Pores
            ctx.fillStyle = '#D0D0B0';
            for (let i = 0; i < 5000; i++) {
                ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
            }
        }
        return new THREE.CanvasTexture(canvas);
    }, []);
}


// --- Realistic Materials ---

const useMaterials = () => {
    const fleshMap = useFleshTexture();
    const boneMap = useBoneTexture();

    return useMemo(() => ({
        bone: new THREE.MeshStandardMaterial({
            map: boneMap,
            color: "#E8E8D0",
            roughness: 0.7,
            metalness: 0.1,
            bumpMap: boneMap,
            bumpScale: 0.02
        }),
        skin: new THREE.MeshPhysicalMaterial({
            color: "#00aaff",
            transmission: 0.6,
            opacity: 0.2,
            transparent: true,
            roughness: 0.1,
            metalness: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        }),
        organ: {
            brain: new THREE.MeshStandardMaterial({ color: "#e0a0a0", roughness: 0.5, metalness: 0.1 }),
            heart: new THREE.MeshPhysicalMaterial({
                color: "#800000",
                roughness: 0.2,
                metalness: 0.1,
                clearcoat: 0.5,
                clearcoatRoughness: 0.2,
                map: fleshMap,
                emissive: "#300000",
                emissiveIntensity: 0.2
            }),
            lungs: new THREE.MeshPhysicalMaterial({
                color: "#d08080",
                roughness: 0.6,
                metalness: 0.0,
                transmission: 0.1,
                thickness: 0.5,
                map: fleshMap
            }),
            liver: new THREE.MeshPhysicalMaterial({
                color: "#5c2a2a",
                roughness: 0.3,
                metalness: 0.0,
                clearcoat: 0.3,
                map: fleshMap
            }),
            stomach: new THREE.MeshStandardMaterial({ color: "#d09080", roughness: 0.4, map: fleshMap }),
            intestine: new THREE.MeshStandardMaterial({ color: "#c0a080", roughness: 0.5, map: fleshMap }),
        },
        vessel: {
            artery: new THREE.MeshStandardMaterial({ color: "#ff0000", roughness: 0.2, metalness: 0.2, emissive: "#500000", emissiveIntensity: 0.2 }),
            vein: new THREE.MeshStandardMaterial({ color: "#0040ff", roughness: 0.2, metalness: 0.2, emissive: "#000050", emissiveIntensity: 0.2 }),
        }
    }), [fleshMap, boneMap]);
};

// --- Shape Generators ---
// (Reusing the advanced geometry logic from previous step, but now applying the new materials)

const createBoneProfile = (height: number, widthTop: number, widthBottom: number, widthShaft: number) => {
    const points = [];
    points.push(new THREE.Vector2(0, height));
    points.push(new THREE.Vector2(widthTop, height * 0.95));
    points.push(new THREE.Vector2(widthTop * 0.8, height * 0.85));
    points.push(new THREE.Vector2(widthShaft, height * 0.8));
    points.push(new THREE.Vector2(widthShaft * 0.8, height * 0.5));
    points.push(new THREE.Vector2(widthShaft, height * 0.2));
    points.push(new THREE.Vector2(widthBottom * 0.9, height * 0.1));
    points.push(new THREE.Vector2(widthBottom, 0.05));
    points.push(new THREE.Vector2(0, 0));
    return points;
};

const createLungShape = (isRight: boolean) => {
    const shape = new THREE.Shape();
    const w = 0.5;
    const h = 1.2;
    shape.moveTo(0, h * 0.8);
    shape.bezierCurveTo(w, h, w, h * 0.5, w, 0.2);
    shape.bezierCurveTo(w * 0.8, 0, w * 0.2, 0, 0, 0.1);
    if (isRight) {
        shape.bezierCurveTo(-0.1, 0.4, -0.1, 0.6, 0, h * 0.8);
    } else {
        shape.bezierCurveTo(-0.3, 0.4, -0.2, 0.7, 0, h * 0.8);
    }
    return shape;
};

const createHeartShape = () => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y - 0.3);
    shape.bezierCurveTo(x + 0.3, y + 0.3, x + 0.3, y + 0.6, x, y + 0.6);
    shape.bezierCurveTo(x - 0.3, y + 0.6, x - 0.3, y + 0.3, x, y - 0.3);
    return shape;
};

const createStomachShape = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0.1, 0.5);
    shape.bezierCurveTo(0.4, 0.5, 0.5, 0.1, 0.3, -0.2);
    shape.bezierCurveTo(0.1, -0.3, -0.1, -0.2, -0.1, 0);
    shape.bezierCurveTo(-0.1, 0.3, 0, 0.4, 0.1, 0.5);
    return shape;
};

const createLiverShape = () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0);
    shape.bezierCurveTo(-0.4, 0.4, 0.4, 0.5, 0.5, 0.1);
    shape.lineTo(0, -0.2);
    shape.lineTo(-0.5, 0);
    return shape;
};


// --- Components ---

const OrganicBone = ({ position, rotation, height, widthTop, widthBottom, widthShaft, material }: any) => {
    const points = useMemo(() => createBoneProfile(height, widthTop, widthBottom, widthShaft), [height, widthTop, widthBottom, widthShaft]);
    return (
        <mesh position={position} rotation={rotation} material={material} castShadow receiveShadow>
            <latheGeometry args={[points, 32]} />
        </mesh>
    );
};

const ExtrudedOrgan = ({ id, position, shape, depth, material, scale = 1, rotation = [0, 0, 0], onClick, pulsing = false }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            let pulse = 1;
            if (pulsing) {
                pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05; // Heartbeat
            }
            const targetScale = (hovered ? 1.05 : 1) * pulse * scale;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    const extrudeSettings = useMemo(() => ({
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 4, // Smoother bevel
        steps: 4,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        curveSegments: 32 // Higher res curves
    }), [depth]);

    return (
        <mesh
            ref={meshRef}
            position={position}
            rotation={rotation}
            material={material}
            onClick={(e) => { e.stopPropagation(); onClick(id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            castShadow
            receiveShadow
        >
            <extrudeGeometry args={[shape, extrudeSettings]} />
        </mesh>
    );
};

// --- Systems ---

const SkeletalSystem = ({ material }: { material: THREE.Material }) => (
    <group>
        <mesh position={[0, 4.8, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.75, 64, 64]} />
        </mesh>

        {Array.from({ length: 18 }).map((_, i) => (
            <mesh key={i} position={[0, 4.0 - i * 0.22, -0.15]} material={material} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            </mesh>
        ))}

        {Array.from({ length: 10 }).map((_, i) => {
            const y = 3.6 - i * 0.22;
            const size = 0.5 + Math.sin(i * 0.4) * 0.3;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.1, 0, -0.2),
                new THREE.Vector3(-size, 0, 0.2),
                new THREE.Vector3(-0.1, -0.2, 0.5),
            ]);
            const curveR = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.1, 0, -0.2),
                new THREE.Vector3(size, 0, 0.2),
                new THREE.Vector3(0.1, -0.2, 0.5),
            ]);
            return (
                <group key={i} position={[0, y, 0]}>
                    <mesh material={material} castShadow>
                        <tubeGeometry args={[curve, 24, 0.03, 16, false]} />
                    </mesh>
                    <mesh material={material} castShadow>
                        <tubeGeometry args={[curveR, 24, 0.03, 16, false]} />
                    </mesh>
                </group>
            );
        })}

        <OrganicBone position={[-1.6, 1.8, 0]} rotation={[0, 0, 0.1]} height={2.5} widthTop={0.15} widthBottom={0.12} widthShaft={0.06} material={material} />
        <OrganicBone position={[1.6, 1.8, 0]} rotation={[0, 0, -0.1]} height={2.5} widthTop={0.15} widthBottom={0.12} widthShaft={0.06} material={material} />
        <OrganicBone position={[-0.6, -3, 0]} rotation={[0, 0, -0.05]} height={3.2} widthTop={0.2} widthBottom={0.18} widthShaft={0.09} material={material} />
        <OrganicBone position={[0.6, -3, 0]} rotation={[0, 0, 0.05]} height={3.2} widthTop={0.2} widthBottom={0.18} widthShaft={0.09} material={material} />

        <mesh position={[0, -0.7, 0]} material={material} rotation={[0, 0, Math.PI]} castShadow>
            <torusGeometry args={[0.55, 0.1, 16, 64, Math.PI]} />
        </mesh>
    </group>
);


const OrganSystem = ({ onSelect, materials }: { onSelect: (id: string) => void, materials: any }) => {
    const leftLungShape = useMemo(() => createLungShape(false), []);
    const rightLungShape = useMemo(() => createLungShape(true), []);
    const heartShape = useMemo(() => createHeartShape(), []);
    const stomachShape = useMemo(() => createStomachShape(), []);
    const liverShape = useMemo(() => createLiverShape(), []);

    const intestineCurve = useMemo(() => {
        const points = [];
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const y = -0.5 - t * 1.2;
            const r = 0.2 + Math.sin(i * 1.5) * 0.1;
            const angle = i * 0.8;
            points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r * 0.6 + 0.2));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    return (
        <group>
            <ExtrudedOrgan id="lungs" shape={leftLungShape} depth={0.4} position={[0.2, 2.5, 0]} rotation={[0, Math.PI, 0]} material={materials.organ.lungs} pulsing onClick={onSelect} />
            <ExtrudedOrgan id="lungs" shape={rightLungShape} depth={0.4} position={[-0.2, 2.5, 0]} rotation={[0, 0, 0]} material={materials.organ.lungs} pulsing onClick={onSelect} />

            <ExtrudedOrgan id="heart" shape={heartShape} depth={0.3} position={[0, 3.2, 0.3]} scale={0.8} rotation={[0, 0, Math.PI]} material={materials.organ.heart} pulsing onClick={onSelect} />

            <ExtrudedOrgan id="liver" shape={liverShape} depth={0.5} position={[-0.3, 2.0, 0.2]} material={materials.organ.liver} onClick={onSelect} />

            <ExtrudedOrgan id="stomach" shape={stomachShape} depth={0.3} position={[0.3, 1.8, 0.2]} rotation={[0, 0, -0.2]} material={materials.organ.stomach} onClick={onSelect} />

            <mesh position={[0, 0.5, 0]} material={materials.organ.intestine} onClick={(e) => { e.stopPropagation(); onSelect('intestines'); }} castShadow receiveShadow>
                <tubeGeometry args={[intestineCurve, 120, 0.06, 16, false]} />
            </mesh>
        </group>
    );
};

const SkinLayer = ({ material }: { material: THREE.Material }) => (
    <group position={[0, 0.5, 0]}>
        <mesh position={[0, 2, 0]} material={material}>
            <capsuleGeometry args={[1.0, 2.5, 4, 32]} />
        </mesh>
        <mesh position={[0, 4.8, 0]} material={material}>
            <sphereGeometry args={[0.92, 64, 64]} />
        </mesh>
        <mesh position={[-1.8, 2, 0]} rotation={[0, 0, 0.2]} material={material}>
            <capsuleGeometry args={[0.3, 3.5, 4, 32]} />
        </mesh>
        <mesh position={[1.8, 2, 0]} rotation={[0, 0, -0.2]} material={material}>
            <capsuleGeometry args={[0.3, 3.5, 4, 32]} />
        </mesh>
        <mesh position={[-0.6, -3, 0]} material={material}>
            <capsuleGeometry args={[0.42, 4.5, 4, 32]} />
        </mesh>
        <mesh position={[0.6, -3, 0]} material={material}>
            <capsuleGeometry args={[0.42, 4.5, 4, 32]} />
        </mesh>
    </group>
);


const HumanAnatomySimulation = () => {
    const [layers, setLayers] = useState<Record<BodySystem, boolean>>({
        skin: true,
        skeletal: true,
        circulatory: true,
        nervous: true,
        organs: true
    });

    console.log("HumanAnatomySimulation mounted");

    const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
    const complexMaterials = useMaterials();

    const toggleLayer = (layer: BodySystem) => {
        setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    return (
        <group>
            {/* --- Cinematic Environment & Lighting --- */}
            <Environment preset="city" blur={0.8} />
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} castShadow shadow-bias={-0.0001} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0040ff" />

            {/* Soft shadows for grounding */}
            <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />

            {/* Stars for background depth */}
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

            {/* --- Main Simulation --- */}
            <Float floatIntensity={0.2} rotationIntensity={0.1} speed={1}>
                {layers.skin && <SkinLayer material={complexMaterials.skin} />}
                {layers.skeletal && <SkeletalSystem material={complexMaterials.bone} />}
                {layers.organs && <OrganSystem onSelect={setSelectedOrgan} materials={complexMaterials} />}
            </Float>

            {/* --- Post Processing Pipeline --- */}
            {/* <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
                <TiltShift blur={0.1} />
            </EffectComposer> */}

            {/* --- UI Overlay (Futuristic) --- */}
            <Html position={[3.5, 4, 0]} style={{ width: '220px', pointerEvents: 'none' }}>
                <div className="bg-black/80 p-5 rounded-xl text-white border border-cyan-500/30 shadow-[0_0_20px_rgba(0,170,255,0.2)] backdrop-blur-md" style={{ pointerEvents: 'auto' }}>
                    <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                        <h3 className="font-bold text-sm tracking-widest text-cyan-100">SYSTEM CONTROLS</h3>
                    </div>
                    <div className="space-y-2">
                        {(Object.keys(layers) as BodySystem[]).map(layer => (
                            <div
                                key={layer}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 ${layers[layer] ? 'bg-cyan-900/40 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,170,255,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}
                                onClick={() => toggleLayer(layer)}
                            >
                                <span className="capitalize text-xs font-semibold tracking-wide text-cyan-50">{layer}</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${layers[layer] ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                                    <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${layers[layer] ? 'left-[18px]' : 'left-[2px]'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Html>

            {selectedOrgan && organData[selectedOrgan] && (
                <Html position={[-3.5, 4, 0]} style={{ width: '280px' }}>
                    <div className="bg-slate-900/90 p-6 rounded-xl text-white border-l-4 border-cyan-500 shadow-2xl animate-in slide-in-from-left-4 duration-300 backdrop-blur-xl">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-display text-2xl font-bold text-cyan-50">{organData[selectedOrgan].name}</h3>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                    {organData[selectedOrgan].system} System
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedOrgan(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
                            >
                                ×
                            </button>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-4" />
                        <p className="text-sm text-cyan-100/80 leading-relaxed font-light">{organData[selectedOrgan].description}</p>
                    </div>
                </Html>
            )}
        </group>
    );
};

export default HumanAnatomySimulation;
