import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Html } from '@react-three/drei';
import { COLORS } from '../utils/voxelHelpers';

interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
}

interface VoxelCharacterProps {
    positionRef: React.MutableRefObject<[number, number, number]>;
    config: CharacterConfig;
    isFlying: boolean;
    flyDirectionRef: React.MutableRefObject<number>;
    showArrows: boolean;
    onCycleOption: (type: 'head' | 'torso' | 'legs', direction: 'left' | 'right') => void;
    scale?: number;
}

// All head options - MoonPay themed astronaut helmets
const HEAD_OPTIONS = [
    { name: 'Classic', visorColor: COLORS.mpPurple, helmetColor: COLORS.mpWhite },
    { name: 'Gradient', visorColor: '#4a0080', helmetColor: COLORS.mpPurple },
    { name: 'Gold', visorColor: COLORS.mpPurple, helmetColor: '#FFD700' },
    { name: 'Dark', visorColor: COLORS.mpPurple, helmetColor: '#333333' },
    { name: 'Glow', visorColor: '#00ff88', helmetColor: COLORS.mpWhite },
    { name: 'Rainbow', visorColor: '#ff6b6b', helmetColor: '#C0C0C0' },
];

// All torso options - MoonPay themed suits
const TORSO_OPTIONS = [
    { name: 'Classic', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Purple', color1: COLORS.mpPurple, color2: COLORS.mpWhite },
    { name: 'Gold', color1: '#FFD700', color2: COLORS.mpPurple },
    { name: 'Tech', color1: '#333333', color2: COLORS.mpPurple },
    { name: 'Space', color1: '#1a1a4e', color2: '#00ff88' },
    { name: 'Silver', color1: '#C0C0C0', color2: COLORS.mpPurple },
];

// All legs options - MoonPay themed boots
const LEGS_OPTIONS = [
    { name: 'Classic', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Purple', color1: COLORS.mpPurple, color2: COLORS.mpDarkPurple },
    { name: 'Gold', color1: '#FFD700', color2: '#B8860B' },
    { name: 'Dark', color1: '#333333', color2: '#111111' },
    { name: 'Tech', color1: '#1a1a4e', color2: '#333366' },
    { name: 'Silver', color1: '#C0C0C0', color2: '#888888' },
];

// Single voxel cube
const Voxel = ({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

// Head component with helmet
const VoxelHead = ({ config, headY }: { config: number; headY: number }) => {
    const option = HEAD_OPTIONS[config];
    
    return (
        <group position={[0, headY, 0]}>
            {/* Helmet base - rounded look with multiple voxels */}
            {/* Back layer */}
            <Voxel position={[-1, 2, -1]} color={option.helmetColor} />
            <Voxel position={[0, 2, -1]} color={option.helmetColor} />
            <Voxel position={[1, 2, -1]} color={option.helmetColor} />
            <Voxel position={[-1, 3, -1]} color={option.helmetColor} />
            <Voxel position={[0, 3, -1]} color={option.helmetColor} />
            <Voxel position={[1, 3, -1]} color={option.helmetColor} />
            <Voxel position={[-1, 4, -1]} color={option.helmetColor} />
            <Voxel position={[0, 4, -1]} color={option.helmetColor} />
            <Voxel position={[1, 4, -1]} color={option.helmetColor} />
            
            {/* Middle layers (sides) */}
            <Voxel position={[-2, 2, 0]} color={option.helmetColor} />
            <Voxel position={[-2, 3, 0]} color={option.helmetColor} />
            <Voxel position={[-2, 4, 0]} color={option.helmetColor} />
            <Voxel position={[2, 2, 0]} color={option.helmetColor} />
            <Voxel position={[2, 3, 0]} color={option.helmetColor} />
            <Voxel position={[2, 4, 0]} color={option.helmetColor} />
            
            {/* Top */}
            <Voxel position={[-1, 5, 0]} color={option.helmetColor} />
            <Voxel position={[0, 5, 0]} color={option.helmetColor} />
            <Voxel position={[1, 5, 0]} color={option.helmetColor} />
            <Voxel position={[-1, 5, -1]} color={option.helmetColor} />
            <Voxel position={[0, 5, -1]} color={option.helmetColor} />
            <Voxel position={[1, 5, -1]} color={option.helmetColor} />
            
            {/* Bottom */}
            <Voxel position={[-1, 1, 0]} color={option.helmetColor} />
            <Voxel position={[0, 1, 0]} color={option.helmetColor} />
            <Voxel position={[1, 1, 0]} color={option.helmetColor} />
            
            {/* Visor (front) */}
            <Voxel position={[-1, 2, 1]} color={option.visorColor} />
            <Voxel position={[0, 2, 1]} color={option.visorColor} />
            <Voxel position={[1, 2, 1]} color={option.visorColor} />
            <Voxel position={[-1, 3, 1]} color={option.visorColor} />
            <Voxel position={[0, 3, 1]} color={option.visorColor} />
            <Voxel position={[1, 3, 1]} color={option.visorColor} />
            <Voxel position={[-1, 4, 1]} color={option.visorColor} />
            <Voxel position={[0, 4, 1]} color={option.visorColor} />
            <Voxel position={[1, 4, 1]} color={option.visorColor} />
        </group>
    );
};

// Torso component
const VoxelTorso = ({ config, torsoY }: { config: number; torsoY: number }) => {
    const option = TORSO_OPTIONS[config];
    
    return (
        <group position={[0, torsoY, 0]}>
            {/* Main body */}
            <Voxel position={[-2, 0, 0]} color={option.color1} />
            <Voxel position={[-1, 0, 0]} color={option.color1} />
            <Voxel position={[0, 0, 0]} color={option.color2} />
            <Voxel position={[1, 0, 0]} color={option.color1} />
            <Voxel position={[2, 0, 0]} color={option.color1} />
            
            <Voxel position={[-2, 1, 0]} color={option.color1} />
            <Voxel position={[-1, 1, 0]} color={option.color1} />
            <Voxel position={[0, 1, 0]} color={option.color2} />
            <Voxel position={[1, 1, 0]} color={option.color1} />
            <Voxel position={[2, 1, 0]} color={option.color1} />
            
            <Voxel position={[-2, 2, 0]} color={option.color1} />
            <Voxel position={[-1, 2, 0]} color={option.color1} />
            <Voxel position={[0, 2, 0]} color={option.color2} />
            <Voxel position={[1, 2, 0]} color={option.color1} />
            <Voxel position={[2, 2, 0]} color={option.color1} />
            
            {/* Shoulders / arms */}
            <Voxel position={[-3, 2, 0]} color={option.color1} />
            <Voxel position={[3, 2, 0]} color={option.color1} />
            <Voxel position={[-3, 1, 0]} color={option.color1} />
            <Voxel position={[3, 1, 0]} color={option.color1} />
            
            {/* Back depth */}
            <Voxel position={[-1, 0, -1]} color={option.color1} />
            <Voxel position={[0, 0, -1]} color={option.color1} />
            <Voxel position={[1, 0, -1]} color={option.color1} />
            <Voxel position={[-1, 1, -1]} color={option.color1} />
            <Voxel position={[0, 1, -1]} color={option.color1} />
            <Voxel position={[1, 1, -1]} color={option.color1} />
            <Voxel position={[-1, 2, -1]} color={option.color1} />
            <Voxel position={[0, 2, -1]} color={option.color1} />
            <Voxel position={[1, 2, -1]} color={option.color1} />
        </group>
    );
};

// Legs component
const VoxelLegs = ({ config }: { config: number }) => {
    const option = LEGS_OPTIONS[config];
    
    return (
        <group position={[0, 0, 0]}>
            {/* Left leg */}
            <Voxel position={[-1, 0, 0]} color={option.color2} />
            <Voxel position={[-1, 1, 0]} color={option.color1} />
            <Voxel position={[-1, 2, 0]} color={option.color1} />
            <Voxel position={[-1, 3, 0]} color={option.color1} />
            
            {/* Right leg */}
            <Voxel position={[1, 0, 0]} color={option.color2} />
            <Voxel position={[1, 1, 0]} color={option.color1} />
            <Voxel position={[1, 2, 0]} color={option.color1} />
            <Voxel position={[1, 3, 0]} color={option.color1} />
        </group>
    );
};

// Jetpack flames - self-animating, bigger when flying
const JetpackFlames = ({ isFlying }: { isFlying: boolean }) => {
    const [intensity, setIntensity] = useState(0.3);
    
    useFrame((state) => {
        // Base intensity is higher when flying
        const baseIntensity = isFlying ? 1.2 : 0.3;
        const variation = isFlying ? 0.5 : 0.15;
        const speed = isFlying ? 15 : 5;
        setIntensity(baseIntensity + Math.sin(state.clock.elapsedTime * speed) * variation);
    });
    
    return (
        <group position={[0, 2, -2]}>
            {/* Jetpack body */}
            <Voxel position={[0, 0, 0]} color="#333333" />
            <Voxel position={[0, 1, 0]} color="#333333" />
            <Voxel position={[0, 2, 0]} color="#444444" />
            <Voxel position={[-1, 0, 0]} color="#555555" />
            <Voxel position={[1, 0, 0]} color="#555555" />
            <Voxel position={[-1, 1, 0]} color="#666666" />
            <Voxel position={[1, 1, 0]} color="#666666" />
            
            {/* Thruster nozzles */}
            <Voxel position={[-1, -1, 0]} color="#222222" />
            <Voxel position={[1, -1, 0]} color="#222222" />
            
            {/* Flames - only show when there's thrust */}
            {intensity > 0.2 && (
                <>
                    {/* Main flames */}
                    <mesh position={[-1, -1.5 - intensity * 0.8, 0]}>
                        <coneGeometry args={[0.5, 1.5 + intensity * 2, 8]} />
                        <meshBasicMaterial color="#ff6600" transparent opacity={0.85} />
                    </mesh>
                    <mesh position={[1, -1.5 - intensity * 0.8, 0]}>
                        <coneGeometry args={[0.5, 1.5 + intensity * 2, 8]} />
                        <meshBasicMaterial color="#ff6600" transparent opacity={0.85} />
                    </mesh>
                    
                    {/* Inner bright flames */}
                    <mesh position={[-1, -1.3 - intensity * 0.5, 0]}>
                        <coneGeometry args={[0.25, 1 + intensity * 1.5, 8]} />
                        <meshBasicMaterial color="#ffff00" transparent opacity={0.95} />
                    </mesh>
                    <mesh position={[1, -1.3 - intensity * 0.5, 0]}>
                        <coneGeometry args={[0.25, 1 + intensity * 1.5, 8]} />
                        <meshBasicMaterial color="#ffff00" transparent opacity={0.95} />
                    </mesh>
                    
                    {/* Core white flames when flying */}
                    {isFlying && (
                        <>
                            <mesh position={[-1, -1.2 - intensity * 0.3, 0]}>
                                <coneGeometry args={[0.12, 0.8 + intensity, 8]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                            </mesh>
                            <mesh position={[1, -1.2 - intensity * 0.3, 0]}>
                                <coneGeometry args={[0.12, 0.8 + intensity, 8]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                            </mesh>
                        </>
                    )}
                </>
            )}
        </group>
    );
};

// Arrow button
const ArrowButton = ({ 
    position, 
    direction, 
    onClick 
}: { 
    position: [number, number, number]; 
    direction: 'left' | 'right';
    onClick: () => void;
}) => {
    return (
        <Html position={position} center>
            <button
                type="button"
                onClick={onClick}
                style={{
                    fontSize: 28,
                    padding: '4px 12px',
                    cursor: 'pointer',
                    backgroundColor: COLORS.mpPurple,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(125, 0, 255, 0.5)'
                }}
            >
                {direction === 'left' ? '◀' : '▶'}
            </button>
        </Html>
    );
};

export const VoxelCharacter = ({ 
    positionRef, 
    config, 
    isFlying,
    flyDirectionRef,
    showArrows,
    onCycleOption,
    scale = 1 
}: VoxelCharacterProps) => {
    const groupRef = useRef<THREE.Group>(null);
    
    // Smooth rotation/lean values
    const currentLeanRef = useRef(0);
    const currentRotationRef = useRef(0);
    
    // Animation - runs every frame for smooth movement
    useFrame((state) => {
        if (!groupRef.current) return;
        
        // Update position from ref (smooth, no re-renders)
        const pos = positionRef.current;
        groupRef.current.position.x = pos[0];
        groupRef.current.position.z = pos[2];
        
        if (isFlying) {
            // Flying animation - faster bob while flying
            const flyBob = Math.sin(state.clock.elapsedTime * 8) * 0.5;
            groupRef.current.position.y = pos[1] + flyBob;
            
            // Smoothly lean forward when flying (tilt on X axis)
            const targetLean = -0.35; // ~20 degrees forward lean
            currentLeanRef.current += (targetLean - currentLeanRef.current) * 0.1;
            groupRef.current.rotation.x = currentLeanRef.current;
            
            // Face the direction of travel (rotate on Y axis)
            const targetRotation = flyDirectionRef.current;
            currentRotationRef.current += (targetRotation - currentRotationRef.current) * 0.08;
            groupRef.current.rotation.y = currentRotationRef.current;
        } else {
            // Enhanced idle hover effect - more pronounced bobbing
            const hoverBob = Math.sin(state.clock.elapsedTime * 1.5) * 0.4;
            groupRef.current.position.y = pos[1] + hoverBob;
            
            // Smoothly return to upright position
            currentLeanRef.current += (0 - currentLeanRef.current) * 0.08;
            groupRef.current.rotation.x = currentLeanRef.current;
            
            // Gentle idle sway
            if (showArrows) {
                // Slow rotation for character creation
                currentRotationRef.current = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
            } else {
                // Return to forward-facing when not in creation mode
                currentRotationRef.current += (0 - currentRotationRef.current) * 0.05;
            }
            groupRef.current.rotation.y = currentRotationRef.current;
        }
    });
    
    // Arrow positions
    const arrowOffset = 6;
    const headArrowY = 12;
    const torsoArrowY = 7;
    const legsArrowY = 2;
    
    return (
        <group ref={groupRef} scale={scale}>
            {/* Legs at base */}
            <VoxelLegs config={config.legsIndex} />
            
            {/* Torso above legs */}
            <VoxelTorso config={config.torsoIndex} torsoY={4} />
            
            {/* Head at top */}
            <VoxelHead config={config.headIndex} headY={7} />
            
            {/* Jetpack - always visible, flames bigger when flying */}
            <JetpackFlames isFlying={isFlying} />
            
            {/* Customization arrows */}
            {showArrows && (
                <>
                    {/* Head arrows */}
                    <ArrowButton 
                        position={[-arrowOffset, headArrowY, 0]} 
                        direction="left" 
                        onClick={() => onCycleOption('head', 'left')}
                    />
                    <ArrowButton 
                        position={[arrowOffset, headArrowY, 0]} 
                        direction="right" 
                        onClick={() => onCycleOption('head', 'right')}
                    />
                    
                    {/* Torso arrows */}
                    <ArrowButton 
                        position={[-arrowOffset, torsoArrowY, 0]} 
                        direction="left" 
                        onClick={() => onCycleOption('torso', 'left')}
                    />
                    <ArrowButton 
                        position={[arrowOffset, torsoArrowY, 0]} 
                        direction="right" 
                        onClick={() => onCycleOption('torso', 'right')}
                    />
                    
                    {/* Legs arrows */}
                    <ArrowButton 
                        position={[-arrowOffset, legsArrowY, 0]} 
                        direction="left" 
                        onClick={() => onCycleOption('legs', 'left')}
                    />
                    <ArrowButton 
                        position={[arrowOffset, legsArrowY, 0]} 
                        direction="right" 
                        onClick={() => onCycleOption('legs', 'right')}
                    />
                </>
            )}
        </group>
    );
};

