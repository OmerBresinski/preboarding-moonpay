import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Html } from '@react-three/drei';
import { COLORS } from '../utils/voxelHelpers';

interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
    headPrimaryColor: string;
    headSecondaryColor: string;
    torsoPrimaryColor: string;
    torsoSecondaryColor: string;
    legsPrimaryColor: string;
    legsSecondaryColor: string;
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

// Head options - 4 shapes with MoonPay colors
const HEAD_OPTIONS = [
    { name: 'Round Helmet', shape: 'round', visorColor: COLORS.mpPurple, helmetColor: COLORS.mpWhite },
    { name: 'Square Helmet', shape: 'square', visorColor: COLORS.mpPurple, helmetColor: COLORS.mpWhite },
    { name: 'Pointed Helmet', shape: 'pointed', visorColor: COLORS.mpPurple, helmetColor: COLORS.mpPurple },
    { name: 'Bubble Visor', shape: 'bubble', visorColor: '#00ffff', helmetColor: COLORS.mpWhite },
];

// Torso options - 4 shapes with MoonPay colors
const TORSO_OPTIONS = [
    { name: 'Standard Suit', shape: 'standard', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Bulky Suit', shape: 'bulky', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Slim Suit', shape: 'slim', color1: COLORS.mpPurple, color2: COLORS.mpWhite },
    { name: 'Armored Suit', shape: 'armored', color1: '#C0C0C0', color2: COLORS.mpPurple },
];

// Legs options - 4 shapes with MoonPay colors
const LEGS_OPTIONS = [
    { name: 'Standard Legs', shape: 'standard', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Bulky Legs', shape: 'bulky', color1: COLORS.mpWhite, color2: COLORS.mpPurple },
    { name: 'Slim Legs', shape: 'slim', color1: COLORS.mpPurple, color2: COLORS.mpDarkPurple },
    { name: 'Robotic Legs', shape: 'robotic', color1: '#C0C0C0', color2: '#333333' },
];

// Single voxel cube
const Voxel = ({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

// Head component with different helmet shapes
const VoxelHead = ({ config, headY, primaryColor, secondaryColor }: { config: number; headY: number; primaryColor: string; secondaryColor: string }) => {
    const option = HEAD_OPTIONS[config];
    const helmetColor = primaryColor;
    const visorColor = secondaryColor;
    
    // Round helmet (original)
    if (option.shape === 'round') {
        return (
            <group position={[0, headY, 0]}>
                {/* Back layer */}
                <Voxel position={[-1, 2, -1]} color={helmetColor} />
                <Voxel position={[0, 2, -1]} color={helmetColor} />
                <Voxel position={[1, 2, -1]} color={helmetColor} />
                <Voxel position={[-1, 3, -1]} color={helmetColor} />
                <Voxel position={[0, 3, -1]} color={helmetColor} />
                <Voxel position={[1, 3, -1]} color={helmetColor} />
                <Voxel position={[-1, 4, -1]} color={helmetColor} />
                <Voxel position={[0, 4, -1]} color={helmetColor} />
                <Voxel position={[1, 4, -1]} color={helmetColor} />
                {/* Sides */}
                <Voxel position={[-2, 2, 0]} color={helmetColor} />
                <Voxel position={[-2, 3, 0]} color={helmetColor} />
                <Voxel position={[-2, 4, 0]} color={helmetColor} />
                <Voxel position={[2, 2, 0]} color={helmetColor} />
                <Voxel position={[2, 3, 0]} color={helmetColor} />
                <Voxel position={[2, 4, 0]} color={helmetColor} />
                {/* Top */}
                <Voxel position={[-1, 5, 0]} color={helmetColor} />
                <Voxel position={[0, 5, 0]} color={helmetColor} />
                <Voxel position={[1, 5, 0]} color={helmetColor} />
                <Voxel position={[-1, 5, -1]} color={helmetColor} />
                <Voxel position={[0, 5, -1]} color={helmetColor} />
                <Voxel position={[1, 5, -1]} color={helmetColor} />
                {/* Bottom */}
                <Voxel position={[-1, 1, 0]} color={helmetColor} />
                <Voxel position={[0, 1, 0]} color={helmetColor} />
                <Voxel position={[1, 1, 0]} color={helmetColor} />
                {/* Visor */}
                <Voxel position={[-1, 2, 1]} color={visorColor} />
                <Voxel position={[0, 2, 1]} color={visorColor} />
                <Voxel position={[1, 2, 1]} color={visorColor} />
                <Voxel position={[-1, 3, 1]} color={visorColor} />
                <Voxel position={[0, 3, 1]} color={visorColor} />
                <Voxel position={[1, 3, 1]} color={visorColor} />
                <Voxel position={[-1, 4, 1]} color={visorColor} />
                <Voxel position={[0, 4, 1]} color={visorColor} />
                <Voxel position={[1, 4, 1]} color={visorColor} />
            </group>
        );
    }
    
    // Square helmet - blocky look
    if (option.shape === 'square') {
        return (
            <group position={[0, headY, 0]}>
                {/* Solid cube helmet */}
                {[-2, -1, 0, 1, 2].map(x => 
                    [1, 2, 3, 4, 5].map(y =>
                        <Voxel key={`sq-${x}-${y}`} position={[x, y, -1]} color={helmetColor} />
                    )
                )}
                {/* Sides */}
                {[-2, 2].map(x => 
                    [1, 2, 3, 4, 5].map(y =>
                        <Voxel key={`side-${x}-${y}`} position={[x, y, 0]} color={helmetColor} />
                    )
                )}
                {/* Top row */}
                {[-1, 0, 1].map(x =>
                    <Voxel key={`top-${x}`} position={[x, 5, 0]} color={helmetColor} />
                )}
                {/* Square visor - smaller */}
                <Voxel position={[-1, 2, 1]} color={visorColor} />
                <Voxel position={[0, 2, 1]} color={visorColor} />
                <Voxel position={[1, 2, 1]} color={visorColor} />
                <Voxel position={[-1, 3, 1]} color={visorColor} />
                <Voxel position={[0, 3, 1]} color={visorColor} />
                <Voxel position={[1, 3, 1]} color={visorColor} />
                {/* Bottom edge */}
                <Voxel position={[-1, 1, 0]} color={helmetColor} />
                <Voxel position={[0, 1, 0]} color={helmetColor} />
                <Voxel position={[1, 1, 0]} color={helmetColor} />
            </group>
        );
    }
    
    // Pointed helmet - with spike on top
    if (option.shape === 'pointed') {
        return (
            <group position={[0, headY, 0]}>
                {/* Base helmet */}
                <Voxel position={[-1, 2, -1]} color={helmetColor} />
                <Voxel position={[0, 2, -1]} color={helmetColor} />
                <Voxel position={[1, 2, -1]} color={helmetColor} />
                <Voxel position={[-1, 3, -1]} color={helmetColor} />
                <Voxel position={[0, 3, -1]} color={helmetColor} />
                <Voxel position={[1, 3, -1]} color={helmetColor} />
                {/* Sides */}
                <Voxel position={[-2, 2, 0]} color={helmetColor} />
                <Voxel position={[-2, 3, 0]} color={helmetColor} />
                <Voxel position={[2, 2, 0]} color={helmetColor} />
                <Voxel position={[2, 3, 0]} color={helmetColor} />
                {/* Pointed top */}
                <Voxel position={[-1, 4, 0]} color={helmetColor} />
                <Voxel position={[0, 4, 0]} color={helmetColor} />
                <Voxel position={[1, 4, 0]} color={helmetColor} />
                <Voxel position={[0, 5, 0]} color={helmetColor} />
                <Voxel position={[0, 6, 0]} color={visorColor} /> {/* Antenna/spike */}
                <Voxel position={[0, 4, -1]} color={helmetColor} />
                {/* Bottom */}
                <Voxel position={[-1, 1, 0]} color={helmetColor} />
                <Voxel position={[0, 1, 0]} color={helmetColor} />
                <Voxel position={[1, 1, 0]} color={helmetColor} />
                {/* Narrow visor */}
                <Voxel position={[-1, 2, 1]} color={visorColor} />
                <Voxel position={[0, 2, 1]} color={visorColor} />
                <Voxel position={[1, 2, 1]} color={visorColor} />
                <Voxel position={[0, 3, 1]} color={visorColor} />
            </group>
        );
    }
    
    // Bubble visor - large dome
    return (
        <group position={[0, headY, 0]}>
            {/* Minimal back */}
            <Voxel position={[0, 2, -1]} color={helmetColor} />
            <Voxel position={[0, 3, -1]} color={helmetColor} />
            {/* Collar */}
            <Voxel position={[-1, 1, 0]} color={helmetColor} />
            <Voxel position={[0, 1, 0]} color={helmetColor} />
            <Voxel position={[1, 1, 0]} color={helmetColor} />
            <Voxel position={[-1, 1, -1]} color={helmetColor} />
            <Voxel position={[1, 1, -1]} color={helmetColor} />
            {/* Large bubble visor - wraps around */}
            <Voxel position={[-2, 2, 0]} color={visorColor} />
            <Voxel position={[-2, 3, 0]} color={visorColor} />
            <Voxel position={[-2, 4, 0]} color={visorColor} />
            <Voxel position={[2, 2, 0]} color={visorColor} />
            <Voxel position={[2, 3, 0]} color={visorColor} />
            <Voxel position={[2, 4, 0]} color={visorColor} />
            <Voxel position={[-1, 2, 1]} color={visorColor} />
            <Voxel position={[0, 2, 1]} color={visorColor} />
            <Voxel position={[1, 2, 1]} color={visorColor} />
            <Voxel position={[-1, 3, 1]} color={visorColor} />
            <Voxel position={[0, 3, 1]} color={visorColor} />
            <Voxel position={[1, 3, 1]} color={visorColor} />
            <Voxel position={[-1, 4, 1]} color={visorColor} />
            <Voxel position={[0, 4, 1]} color={visorColor} />
            <Voxel position={[1, 4, 1]} color={visorColor} />
            <Voxel position={[-1, 5, 0]} color={visorColor} />
            <Voxel position={[0, 5, 0]} color={visorColor} />
            <Voxel position={[1, 5, 0]} color={visorColor} />
            <Voxel position={[0, 5, 1]} color={visorColor} />
        </group>
    );
};

// Torso component with different shapes
const VoxelTorso = ({ config, torsoY, primaryColor, secondaryColor }: { config: number; torsoY: number; primaryColor: string; secondaryColor: string }) => {
    const option = TORSO_OPTIONS[config];
    const color1 = primaryColor;
    const color2 = secondaryColor;
    
    // Standard suit
    if (option.shape === 'standard') {
        return (
            <group position={[0, torsoY, 0]}>
                {/* Main body */}
                <Voxel position={[-2, 0, 0]} color={color1} />
                <Voxel position={[-1, 0, 0]} color={color1} />
                <Voxel position={[0, 0, 0]} color={color2} />
                <Voxel position={[1, 0, 0]} color={color1} />
                <Voxel position={[2, 0, 0]} color={color1} />
                <Voxel position={[-2, 1, 0]} color={color1} />
                <Voxel position={[-1, 1, 0]} color={color1} />
                <Voxel position={[0, 1, 0]} color={color2} />
                <Voxel position={[1, 1, 0]} color={color1} />
                <Voxel position={[2, 1, 0]} color={color1} />
                <Voxel position={[-2, 2, 0]} color={color1} />
                <Voxel position={[-1, 2, 0]} color={color1} />
                <Voxel position={[0, 2, 0]} color={color2} />
                <Voxel position={[1, 2, 0]} color={color1} />
                <Voxel position={[2, 2, 0]} color={color1} />
                {/* Arms */}
                <Voxel position={[-3, 2, 0]} color={color1} />
                <Voxel position={[3, 2, 0]} color={color1} />
                <Voxel position={[-3, 1, 0]} color={color1} />
                <Voxel position={[3, 1, 0]} color={color1} />
                {/* Back */}
                <Voxel position={[-1, 0, -1]} color={color1} />
                <Voxel position={[0, 0, -1]} color={color1} />
                <Voxel position={[1, 0, -1]} color={color1} />
                <Voxel position={[-1, 1, -1]} color={color1} />
                <Voxel position={[0, 1, -1]} color={color1} />
                <Voxel position={[1, 1, -1]} color={color1} />
                <Voxel position={[-1, 2, -1]} color={color1} />
                <Voxel position={[0, 2, -1]} color={color1} />
                <Voxel position={[1, 2, -1]} color={color1} />
            </group>
        );
    }
    
    // Bulky suit - wider and taller
    if (option.shape === 'bulky') {
        return (
            <group position={[0, torsoY, 0]}>
                {/* Wide body */}
                {[-3, -2, -1, 0, 1, 2, 3].map(x =>
                    [0, 1, 2, 3].map(y =>
                        <Voxel key={`bulky-${x}-${y}`} position={[x, y, 0]} color={x === 0 ? color2 : color1} />
                    )
                )}
                {/* Thick back */}
                {[-2, -1, 0, 1, 2].map(x =>
                    [0, 1, 2, 3].map(y =>
                        <Voxel key={`back-${x}-${y}`} position={[x, y, -1]} color={color1} />
                    )
                )}
                {/* Bulky arms */}
                <Voxel position={[-4, 3, 0]} color={color1} />
                <Voxel position={[-4, 2, 0]} color={color1} />
                <Voxel position={[-4, 1, 0]} color={color1} />
                <Voxel position={[4, 3, 0]} color={color1} />
                <Voxel position={[4, 2, 0]} color={color1} />
                <Voxel position={[4, 1, 0]} color={color1} />
                {/* Shoulder pads */}
                <Voxel position={[-3, 4, 0]} color={color2} />
                <Voxel position={[3, 4, 0]} color={color2} />
            </group>
        );
    }
    
    // Slim suit - narrow
    if (option.shape === 'slim') {
        return (
            <group position={[0, torsoY, 0]}>
                {/* Narrow body */}
                <Voxel position={[-1, 0, 0]} color={color1} />
                <Voxel position={[0, 0, 0]} color={color2} />
                <Voxel position={[1, 0, 0]} color={color1} />
                <Voxel position={[-1, 1, 0]} color={color1} />
                <Voxel position={[0, 1, 0]} color={color2} />
                <Voxel position={[1, 1, 0]} color={color1} />
                <Voxel position={[-1, 2, 0]} color={color1} />
                <Voxel position={[0, 2, 0]} color={color2} />
                <Voxel position={[1, 2, 0]} color={color1} />
                {/* Slim arms */}
                <Voxel position={[-2, 2, 0]} color={color1} />
                <Voxel position={[2, 2, 0]} color={color1} />
                <Voxel position={[-2, 1, 0]} color={color1} />
                <Voxel position={[2, 1, 0]} color={color1} />
                <Voxel position={[-2, 0, 0]} color={color1} />
                <Voxel position={[2, 0, 0]} color={color1} />
                {/* Back */}
                <Voxel position={[0, 0, -1]} color={color1} />
                <Voxel position={[0, 1, -1]} color={color1} />
                <Voxel position={[0, 2, -1]} color={color1} />
            </group>
        );
    }
    
    // Armored suit - with plates
    return (
        <group position={[0, torsoY, 0]}>
            {/* Core body */}
            <Voxel position={[-2, 0, 0]} color={color1} />
            <Voxel position={[-1, 0, 0]} color={color1} />
            <Voxel position={[0, 0, 0]} color={color2} />
            <Voxel position={[1, 0, 0]} color={color1} />
            <Voxel position={[2, 0, 0]} color={color1} />
            <Voxel position={[-2, 1, 0]} color={color1} />
            <Voxel position={[-1, 1, 0]} color={color1} />
            <Voxel position={[0, 1, 0]} color={color2} />
            <Voxel position={[1, 1, 0]} color={color1} />
            <Voxel position={[2, 1, 0]} color={color1} />
            <Voxel position={[-2, 2, 0]} color={color1} />
            <Voxel position={[-1, 2, 0]} color={color1} />
            <Voxel position={[0, 2, 0]} color={color2} />
            <Voxel position={[1, 2, 0]} color={color1} />
            <Voxel position={[2, 2, 0]} color={color1} />
            {/* Armor plates (front) */}
            <Voxel position={[-2, 1, 1]} color={color2} />
            <Voxel position={[2, 1, 1]} color={color2} />
            <Voxel position={[-1, 0, 1]} color={color2} />
            <Voxel position={[1, 0, 1]} color={color2} />
            {/* Heavy shoulder armor */}
            <Voxel position={[-3, 2, 0]} color={color2} />
            <Voxel position={[-3, 3, 0]} color={color2} />
            <Voxel position={[3, 2, 0]} color={color2} />
            <Voxel position={[3, 3, 0]} color={color2} />
            <Voxel position={[-3, 1, 0]} color={color1} />
            <Voxel position={[3, 1, 0]} color={color1} />
            {/* Back armor */}
            <Voxel position={[-1, 0, -1]} color={color1} />
            <Voxel position={[0, 0, -1]} color={color1} />
            <Voxel position={[1, 0, -1]} color={color1} />
            <Voxel position={[-1, 1, -1]} color={color1} />
            <Voxel position={[0, 1, -1]} color={color1} />
            <Voxel position={[1, 1, -1]} color={color1} />
            <Voxel position={[-1, 2, -1]} color={color1} />
            <Voxel position={[0, 2, -1]} color={color1} />
            <Voxel position={[1, 2, -1]} color={color1} />
            <Voxel position={[0, 2, -2]} color={color2} /> {/* Back plate */}
        </group>
    );
};

// Legs component with different shapes
const VoxelLegs = ({ config, primaryColor, secondaryColor }: { config: number; primaryColor: string; secondaryColor: string }) => {
    const option = LEGS_OPTIONS[config];
    const color1 = primaryColor;
    const color2 = secondaryColor;
    
    // Standard legs
    if (option.shape === 'standard') {
        return (
            <group position={[0, 0, 0]}>
                {/* Left leg */}
                <Voxel position={[-1, 0, 0]} color={color2} />
                <Voxel position={[-1, 1, 0]} color={color1} />
                <Voxel position={[-1, 2, 0]} color={color1} />
                <Voxel position={[-1, 3, 0]} color={color1} />
                {/* Right leg */}
                <Voxel position={[1, 0, 0]} color={color2} />
                <Voxel position={[1, 1, 0]} color={color1} />
                <Voxel position={[1, 2, 0]} color={color1} />
                <Voxel position={[1, 3, 0]} color={color1} />
            </group>
        );
    }
    
    // Bulky legs - wider
    if (option.shape === 'bulky') {
        return (
            <group position={[0, 0, 0]}>
                {/* Left leg - wide */}
                <Voxel position={[-2, 0, 0]} color={color2} />
                <Voxel position={[-1, 0, 0]} color={color2} />
                <Voxel position={[-2, 1, 0]} color={color1} />
                <Voxel position={[-1, 1, 0]} color={color1} />
                <Voxel position={[-2, 2, 0]} color={color1} />
                <Voxel position={[-1, 2, 0]} color={color1} />
                <Voxel position={[-2, 3, 0]} color={color1} />
                <Voxel position={[-1, 3, 0]} color={color1} />
                {/* Back */}
                <Voxel position={[-2, 1, -1]} color={color1} />
                <Voxel position={[-2, 2, -1]} color={color1} />
                {/* Right leg - wide */}
                <Voxel position={[1, 0, 0]} color={color2} />
                <Voxel position={[2, 0, 0]} color={color2} />
                <Voxel position={[1, 1, 0]} color={color1} />
                <Voxel position={[2, 1, 0]} color={color1} />
                <Voxel position={[1, 2, 0]} color={color1} />
                <Voxel position={[2, 2, 0]} color={color1} />
                <Voxel position={[1, 3, 0]} color={color1} />
                <Voxel position={[2, 3, 0]} color={color1} />
                {/* Back */}
                <Voxel position={[2, 1, -1]} color={color1} />
                <Voxel position={[2, 2, -1]} color={color1} />
            </group>
        );
    }
    
    // Slim legs - thin
    if (option.shape === 'slim') {
        return (
            <group position={[0, 0, 0]}>
                {/* Left leg - thin and longer */}
                <Voxel position={[-1, 0, 0]} color={color2} />
                <Voxel position={[-1, 1, 0]} color={color1} />
                <Voxel position={[-1, 2, 0]} color={color1} />
                <Voxel position={[-1, 3, 0]} color={color1} />
                <Voxel position={[-1, 4, 0]} color={color1} />
                {/* Right leg - thin and longer */}
                <Voxel position={[1, 0, 0]} color={color2} />
                <Voxel position={[1, 1, 0]} color={color1} />
                <Voxel position={[1, 2, 0]} color={color1} />
                <Voxel position={[1, 3, 0]} color={color1} />
                <Voxel position={[1, 4, 0]} color={color1} />
            </group>
        );
    }
    
    // Robotic legs - mechanical look
    return (
        <group position={[0, 0, 0]}>
            {/* Left leg - mechanical */}
            <Voxel position={[-1, 0, 0]} color={color2} />
            <Voxel position={[-2, 0, 0]} color={color2} /> {/* Wide foot */}
            <Voxel position={[-1, 1, 0]} color={color1} />
            <Voxel position={[-1, 2, 0]} color={color2} /> {/* Joint */}
            <Voxel position={[-1, 3, 0]} color={color1} />
            {/* Pistons/details */}
            <Voxel position={[-2, 1, 0]} color={color2} />
            <Voxel position={[-2, 3, 0]} color={color2} />
            {/* Right leg - mechanical */}
            <Voxel position={[1, 0, 0]} color={color2} />
            <Voxel position={[2, 0, 0]} color={color2} /> {/* Wide foot */}
            <Voxel position={[1, 1, 0]} color={color1} />
            <Voxel position={[1, 2, 0]} color={color2} /> {/* Joint */}
            <Voxel position={[1, 3, 0]} color={color1} />
            {/* Pistons/details */}
            <Voxel position={[2, 1, 0]} color={color2} />
            <Voxel position={[2, 3, 0]} color={color2} />
        </group>
    );
};

// Jetpack flames - ALWAYS visible, bigger when flying
const JetpackFlames = ({ isFlying }: { isFlying: boolean }) => {
    const [intensity, setIntensity] = useState(0.5);
    
    useFrame((state) => {
        // Base intensity - always visible, bigger when flying
        const baseIntensity = isFlying ? 1.2 : 0.6;
        const variation = isFlying ? 0.5 : 0.2;
        const speed = isFlying ? 15 : 8;
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
            
            {/* Flames - ALWAYS visible */}
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
            <VoxelLegs 
                config={config.legsIndex} 
                primaryColor={config.legsPrimaryColor}
                secondaryColor={config.legsSecondaryColor}
            />
            
            {/* Torso above legs */}
            <VoxelTorso 
                config={config.torsoIndex} 
                torsoY={4}
                primaryColor={config.torsoPrimaryColor}
                secondaryColor={config.torsoSecondaryColor}
            />
            
            {/* Head at top */}
            <VoxelHead 
                config={config.headIndex} 
                headY={7}
                primaryColor={config.headPrimaryColor}
                secondaryColor={config.headSecondaryColor}
            />
            
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

