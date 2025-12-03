import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { COLORS } from '../../utils/voxelHelpers';

interface MoonProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const Moon = ({ position }: MoonProps) => {
    const earthRef = useRef<THREE.Mesh>(null);
    
    // Slow Earth rotation
    useFrame((state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });
    
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const moonGrey = COLORS.moonGrey;
        const moonDark = COLORS.moonDark;
        const moonCrater = COLORS.moonCrater;
        const moonLight = '#d0d0d0';
        
        // ============ MOON SURFACE ============
        // Create a curved surface using voxels
        const surfaceRadius = 50;
        const surfaceDepth = 8;
        
        for (let x = -25; x <= 25; x++) {
            for (let z = -25; z <= 25; z++) {
                // Calculate height based on distance from center (curved surface)
                const dist = Math.sqrt(x * x + z * z);
                if (dist <= 25) {
                    const baseHeight = Math.floor(Math.sqrt(surfaceRadius * surfaceRadius - dist * dist) - surfaceRadius + surfaceDepth);
                    
                    // Add some terrain variation
                    const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2;
                    const height = Math.max(0, baseHeight + Math.floor(noise));
                    
                    for (let y = 0; y <= height; y++) {
                        // Vary colors for texture
                        let color = moonGrey;
                        if (y === height) {
                            // Surface variation
                            const surfaceNoise = (x + z) % 3;
                            color = surfaceNoise === 0 ? moonLight : (surfaceNoise === 1 ? moonGrey : moonDark);
                        } else {
                            color = moonDark;
                        }
                        result.push({ pos: [x, y, z], color });
                    }
                }
            }
        }
        
        // ============ CRATERS ============
        const craters = [
            { x: 5, z: 5, radius: 4, depth: 2 },
            { x: -10, z: 8, radius: 3, depth: 1 },
            { x: 8, z: -12, radius: 5, depth: 2 },
            { x: -5, z: -8, radius: 3, depth: 1 },
            { x: 15, z: 0, radius: 4, depth: 2 },
            { x: -15, z: -5, radius: 3, depth: 1 },
        ];
        
        for (const crater of craters) {
            for (let dx = -crater.radius; dx <= crater.radius; dx++) {
                for (let dz = -crater.radius; dz <= crater.radius; dz++) {
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist <= crater.radius) {
                        const cx = crater.x + dx;
                        const cz = crater.z + dz;
                        // Crater rim (raised edge)
                        if (dist > crater.radius - 1) {
                            result.push({ pos: [cx, 4, cz], color: moonLight });
                        }
                        // Crater floor (lower)
                        else {
                            result.push({ pos: [cx, 3 - crater.depth, cz], color: moonCrater });
                        }
                    }
                }
            }
        }
        
        // ============ MOONPAY FLAG! ============
        // Flag pole
        for (let y = 1; y <= 12; y++) {
            result.push({ pos: [0, y + 3, 0], color: '#c0c0c0' });
        }
        
        // MoonPay flag (purple and white)
        for (let y = 8; y <= 14; y++) {
            for (let z = 1; z <= 5; z++) {
                const isPurple = y < 11;
                result.push({ pos: [0, y + 3, z], color: isPurple ? COLORS.mpPurple : COLORS.mpWhite });
            }
        }
        
        // "M" logo on flag
        result.push({ pos: [0, 12, 2], color: COLORS.mpWhite });
        result.push({ pos: [0, 13, 3], color: COLORS.mpWhite });
        result.push({ pos: [0, 12, 4], color: COLORS.mpWhite });
        
        // ============ LUNAR MODULE ============
        const lmX = -8;
        const lmZ = 5;
        const lmBase = 4;
        
        // Descent stage (gold foil)
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                result.push({ pos: [lmX + x, lmBase, lmZ + z], color: '#c0a040' });
                result.push({ pos: [lmX + x, lmBase + 1, lmZ + z], color: '#c0a040' });
            }
        }
        
        // Landing legs
        const legs = [[-3, -3], [-3, 3], [3, -3], [3, 3]];
        for (const [lx, lz] of legs) {
            result.push({ pos: [lmX + lx, lmBase - 1, lmZ + lz], color: '#808080' });
            result.push({ pos: [lmX + lx, lmBase - 2, lmZ + lz], color: '#808080' });
            // Foot pad
            result.push({ pos: [lmX + lx, lmBase - 3, lmZ + lz], color: '#606060' });
        }
        
        // Ascent stage
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                result.push({ pos: [lmX + x, lmBase + 2, lmZ + z], color: '#e0e0e0' });
                result.push({ pos: [lmX + x, lmBase + 3, lmZ + z], color: '#e0e0e0' });
            }
        }
        
        // Window
        result.push({ pos: [lmX, lmBase + 3, lmZ + 2], color: '#303040' });
        
        // ============ FOOTPRINTS ============
        const footprints = [
            [0, 3], [1, 5], [0, 7], [-1, 9], [0, 11],
            [-2, 4], [-4, 5], [-6, 6],
        ];
        
        for (const [fx, fz] of footprints) {
            result.push({ pos: [fx, 3, fz], color: '#999999' });
        }
        
        return result;
    }, []);

    return (
        <group position={position}>
            {/* Earth in the distance */}
            <mesh ref={earthRef} position={[80, 60, -100]}>
                <sphereGeometry args={[20, 32, 32]} />
                <meshStandardMaterial color="#4a8fcc" />
            </mesh>
            
            {/* Earth clouds */}
            <mesh position={[80, 60, -100]}>
                <sphereGeometry args={[21, 32, 32]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            
            {/* Sun (bright light source) */}
            <mesh position={[200, 100, 0]}>
                <sphereGeometry args={[30, 16, 16]} />
                <meshBasicMaterial color="#ffff80" />
            </mesh>
            
            {/* Additional point light from sun */}
            <pointLight position={[200, 100, 0]} intensity={2} distance={500} />
            
            {/* Moon voxels */}
            {voxels.map((v) => (
                <Voxel key={`${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

