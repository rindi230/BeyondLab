import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { elements, ElementData, getCategoryColor } from '../utils/ElementData';
import ReactionScene from './ReactionScene';

const ElementBlock = ({
    element,
    position,
    isSelected,
    onClick
}: {
    element: ElementData,
    position: [number, number, number],
    isSelected: boolean,
    onClick: (e: ElementData) => void
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Animate selection/hover
    useFrame((state) => {
        if (meshRef.current) {
            const targetScale = hovered || isSelected ? 1.1 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            if (isSelected) {
                meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
            } else {
                meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
            }
        }
    });

    const categoryColor = getCategoryColor(element.category);

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(element); }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <boxGeometry args={[0.9, 0.9, 0.2]} />
                <meshStandardMaterial
                    color={isSelected ? '#FFFFFF' : categoryColor}
                    emissive={isSelected ? '#FFFFFF' : categoryColor}
                    emissiveIntensity={isSelected ? 0.5 : 0.1}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Symbol */}
            <Text position={[0, 0.1, 0.11]} fontSize={0.35} color="black" fontWeight="bold">
                {element.symbol}
            </Text>
            {/* Atomic Number */}
            <Text position={[-0.3, 0.3, 0.11]} fontSize={0.15} color="black">
                {element.atomicNumber}
            </Text>
            {/* Name (Small) */}
            <Text position={[0, -0.3, 0.11]} fontSize={0.1} color="black">
                {element.name}
            </Text>
        </group>
    );
};

const PeriodicTableSimulation = () => {
    const [selectedElements, setSelectedElements] = useState<ElementData[]>([]);
    const [showReaction, setShowReaction] = useState(false);

    const getPosition = (element: ElementData): [number, number, number] => {
        let x = element.group - 9.5;
        let y = -(element.period - 4);
        let z = 0;

        if (element.atomicNumber >= 57 && element.atomicNumber <= 71) {
            y = -4.5;
            x = (element.atomicNumber - 57) - 6;
        } else if (element.atomicNumber >= 89 && element.atomicNumber <= 103) {
            y = -5.5;
            x = (element.atomicNumber - 89) - 6;
        }

        return [x * 1.1, y * 1.1, z];
    };

    const handleElementClick = (element: ElementData) => {
        if (showReaction) return;

        setSelectedElements(prev => {
            const isAlreadySelected = prev.find(e => e.symbol === element.symbol);
            if (isAlreadySelected) {
                return prev.filter(e => e.symbol !== element.symbol);
            }
            if (prev.length < 2) {
                return [...prev, element];
            }
            return [prev[1], element];
        });
    };

    const startSimulate = () => {
        if (selectedElements.length === 2) {
            setShowReaction(true);
        }
    };

    const resetSelection = () => {
        setSelectedElements([]);
        setShowReaction(false);
    };

    if (showReaction && selectedElements.length === 2) {
        return <ReactionScene element1={selectedElements[0]} element2={selectedElements[1]} onBack={() => setShowReaction(false)} />;
    }

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

            {/* Table Header/UI in 3D space */}
            <group position={[0, 6, 0]}>
                <Text fontSize={0.8} color="white" position={[0, 0, 0]}>
                    Periodic Table of Elements
                </Text>
                <Text fontSize={0.3} color="#AAA" position={[0, -0.6, 0]}>
                    Select two elements to simulate interaction
                </Text>
            </group>

            {/* Render Elements */}
            {elements.map((element) => (
                <ElementBlock
                    key={element.symbol}
                    element={element}
                    position={getPosition(element)}
                    isSelected={!!selectedElements.find(e => e.symbol === element.symbol)}
                    onClick={handleElementClick}
                />
            ))}

            {/* Premium UI Overlay */}
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div className="absolute inset-0 flex flex-col justify-end items-center p-12 space-y-6">
                    {selectedElements.length > 0 && (
                        <div
                            className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <div className="flex items-center gap-8">
                                {selectedElements.map((el, idx) => (
                                    <React.Fragment key={el.symbol}>
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-2"
                                                style={{
                                                    backgroundColor: getCategoryColor(el.category),
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                    color: 'black'
                                                }}
                                            >
                                                {el.symbol}
                                            </div>
                                            <span className="text-white/60 text-[10px] mt-2 font-medium tracking-widest uppercase">{el.name}</span>
                                        </div>
                                        {idx === 0 && selectedElements.length === 2 && (
                                            <div className="text-white/40 text-2xl font-light">+</div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={resetSelection}
                                    className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold tracking-widest uppercase transition-all border border-white/5 active:scale-95"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={startSimulate}
                                    disabled={selectedElements.length < 2}
                                    className={`px-8 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] ${selectedElements.length === 2
                                            ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                                        }`}
                                >
                                    Simulate Reaction
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
};

export default PeriodicTableSimulation;
