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
    const moonRef = useRef<THREE.Group>(null);
    
    // Slow Earth rotation
    useFrame((state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
        // Very slow moon rotation
        if (moonRef.current) {
            moonRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        }
    });
    
    const moonVoxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const moonGrey = COLORS.moonGrey;
        const moonDark = COLORS.moonDark;
        const moonCrater = COLORS.moonCrater;
        const moonLight = '#d0d0d0';
        
        // ============ SPHERICAL MOON ============
        const radius = 25;
        
        // Create a voxel sphere
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const dist = Math.sqrt(x * x + y * y + z * z);
                    
                    // Only place voxels on the surface (shell) with some thickness
                    if (dist <= radius && dist > radius - 3) {
                        // Color variation based on position
                        const colorNoise = Math.sin(x * 0.3) * Math.cos(y * 0.4) * Math.sin(z * 0.35);
                        let color: string;
                        
                        if (colorNoise > 0.5) {
                            color = moonLight;
                        } else if (colorNoise > 0) {
                            color = moonGrey;
                        } else if (colorNoise > -0.3) {
                            color = moonDark;
                        } else {
                            color = moonCrater;
                        }
                        
                        result.push({ pos: [x, y + radius, z], color });
                    }
                }
            }
        }
        
        return result;
    }, []);
    
    // Surface decorations (flag, lander) - separate so they don't rotate
    const surfaceVoxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        // Position on top of the sphere
        const surfaceY = 50; // Top of the moon sphere
        
        // ============ MOONPAY FLAG! ============
        // Flag pole
        for (let y = 0; y <= 12; y++) {
            result.push({ pos: [0, surfaceY + y, 0], color: '#c0c0c0' });
        }
        
        // MoonPay flag (purple and white)
        for (let y = 6; y <= 12; y++) {
            for (let z = 1; z <= 5; z++) {
                const isPurple = y < 9;
                result.push({ pos: [0, surfaceY + y, z], color: isPurple ? COLORS.mpPurple : COLORS.mpWhite });
            }
        }
        
        // "M" logo on flag
        result.push({ pos: [0, surfaceY + 10, 2], color: COLORS.mpWhite });
        result.push({ pos: [0, surfaceY + 11, 3], color: COLORS.mpWhite });
        result.push({ pos: [0, surfaceY + 10, 4], color: COLORS.mpWhite });
        
        // ============ LUNAR MODULE ============
        const lmX = -8;
        const lmZ = 8;
        const lmBase = surfaceY;
        
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
            
            {/* Spherical Moon - slowly rotating */}
            <group ref={moonRef}>
                {moonVoxels.map((v) => (
                    <Voxel key={`moon-${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
                ))}
            </group>
            
            {/* Surface decorations - don't rotate */}
            {surfaceVoxels.map((v) => (
                <Voxel key={`surf-${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

