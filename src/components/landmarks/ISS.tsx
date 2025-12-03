import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { COLORS } from '../../utils/voxelHelpers';

interface ISSProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const ISS = ({ position }: ISSProps) => {
    const groupRef = useRef<THREE.Group>(null);
    
    // Slow rotation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });
    
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const white = COLORS.issWhite;
        const solar = COLORS.issSolar;
        const gold = '#c0a040';
        const grey = '#808080';
        
        // ============ MAIN TRUSS (backbone) ============
        // The ISS truss is the long horizontal beam
        for (let x = -25; x <= 25; x++) {
            result.push({ pos: [x, 0, 0], color: white });
            result.push({ pos: [x, 1, 0], color: white });
            result.push({ pos: [x, 0, 1], color: grey });
            result.push({ pos: [x, 1, 1], color: grey });
        }
        
        // ============ SOLAR PANEL ARRAYS ============
        // Left side panels (4 pairs)
        const solarPositions = [-20, -12, 12, 20];
        
        for (const sx of solarPositions) {
            // Each solar array pair
            for (let panel = -1; panel <= 1; panel += 2) {
                // Panel wing extends perpendicular to truss
                for (let z = 2; z <= 15; z++) {
                    for (let y = -1; y <= 2; y++) {
                        // Create solar cell pattern
                        const cellColor = (z + y) % 2 === 0 ? solar : '#2a2a5e';
                        result.push({ pos: [sx, y, z * panel], color: cellColor });
                        result.push({ pos: [sx + 1, y, z * panel], color: cellColor });
                    }
                }
                
                // Panel frame
                for (let z = 2; z <= 15; z++) {
                    result.push({ pos: [sx, -2, z * panel], color: gold });
                    result.push({ pos: [sx, 3, z * panel], color: gold });
                }
            }
        }
        
        // ============ HABITATION MODULES ============
        // Main modules run perpendicular to truss
        
        // Destiny Lab (US Lab)
        for (let z = -8; z <= 8; z++) {
            for (let x = -2; x <= 2; x++) {
                result.push({ pos: [x, 0, z], color: white });
                result.push({ pos: [x, 1, z], color: white });
                result.push({ pos: [x, 2, z], color: white });
                result.push({ pos: [x, -1, z], color: grey });
            }
        }
        
        // Unity Node (center)
        for (let x = -3; x <= 3; x++) {
            for (let y = -1; y <= 2; y++) {
                for (let z = -2; z <= 2; z++) {
                    result.push({ pos: [x, y, z], color: white });
                }
            }
        }
        
        // Columbus Lab (European)
        for (let z = 9; z <= 14; z++) {
            result.push({ pos: [0, 0, z], color: white });
            result.push({ pos: [0, 1, z], color: white });
            result.push({ pos: [1, 0, z], color: '#e0e0e0' });
            result.push({ pos: [1, 1, z], color: '#e0e0e0' });
            result.push({ pos: [-1, 0, z], color: '#e0e0e0' });
            result.push({ pos: [-1, 1, z], color: '#e0e0e0' });
        }
        
        // Kibo Lab (Japanese)
        for (let z = -14; z <= -9; z++) {
            result.push({ pos: [0, 0, z], color: white });
            result.push({ pos: [0, 1, z], color: white });
            result.push({ pos: [0, 2, z], color: '#f0f0f0' });
            result.push({ pos: [1, 0, z], color: white });
            result.push({ pos: [1, 1, z], color: white });
            result.push({ pos: [-1, 0, z], color: white });
            result.push({ pos: [-1, 1, z], color: white });
        }
        
        // ============ DOCKING PORTS ============
        // Various docking nodes
        result.push({ pos: [4, 1, 0], color: grey });
        result.push({ pos: [5, 1, 0], color: grey });
        result.push({ pos: [-4, 1, 0], color: grey });
        result.push({ pos: [-5, 1, 0], color: grey });
        
        // ============ RADIATORS ============
        // Heat radiators (white panels perpendicular to solar panels)
        for (let x = -8; x <= -5; x++) {
            for (let y = 3; y <= 8; y++) {
                result.push({ pos: [x, y, 0], color: white });
                result.push({ pos: [x, y, 1], color: '#f8f8f8' });
            }
        }
        for (let x = 5; x <= 8; x++) {
            for (let y = 3; y <= 8; y++) {
                result.push({ pos: [x, y, 0], color: white });
                result.push({ pos: [x, y, 1], color: '#f8f8f8' });
            }
        }
        
        // ============ CUPOLA (observation dome) ============
        result.push({ pos: [0, -2, 0], color: '#404060' });
        result.push({ pos: [0, -3, 0], color: '#303050' });
        result.push({ pos: [1, -2, 0], color: '#404060' });
        result.push({ pos: [-1, -2, 0], color: '#404060' });
        
        return result;
    }, []);

    return (
        <group position={position} ref={groupRef}>
            {/* Earth below (as a large sphere, partially visible) */}
            <mesh position={[0, -150, 0]}>
                <sphereGeometry args={[130, 64, 64]} />
                <meshStandardMaterial color="#4a8fcc" />
            </mesh>
            
            {/* Earth land masses (simplified) */}
            <mesh position={[30, -130, 40]}>
                <sphereGeometry args={[25, 16, 16]} />
                <meshStandardMaterial color="#3a7a3a" />
            </mesh>
            
            {/* ISS voxels */}
            {voxels.map((v) => (
                <Voxel key={`${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

