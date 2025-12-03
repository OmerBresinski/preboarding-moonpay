import { useMemo } from 'react';
import { COLORS } from '../../utils/voxelHelpers';

interface EiffelTowerProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const EiffelTower = ({ position }: EiffelTowerProps) => {
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const brown = COLORS.eiffelBrown;
        const rust = COLORS.eiffelRust;
        const light = '#a06030';
        
        // ============ BASE LEGS (4 legs) ============
        const legOffset = 8;
        const baseHeight = 15;
        
        // Generate each leg tapering inward as it goes up
        for (let y = 0; y < baseHeight; y++) {
            // How much to narrow the legs as we go up
            const narrowing = Math.floor(y / 3);
            const currentOffset = legOffset - narrowing;
            
            // Each leg is a 2x2 column at this level
            const legPositions = [
                [currentOffset, currentOffset],   // Front right
                [-currentOffset, currentOffset],  // Front left
                [currentOffset, -currentOffset],  // Back right
                [-currentOffset, -currentOffset], // Back left
            ];
            
            for (const [lx, lz] of legPositions) {
                // Main leg column
                result.push({ pos: [lx, y, lz], color: y % 2 === 0 ? brown : rust });
                result.push({ pos: [lx + (lx > 0 ? -1 : 1), y, lz], color: brown });
                result.push({ pos: [lx, y, lz + (lz > 0 ? -1 : 1)], color: brown });
            }
            
            // Cross bracing between legs
            if (y % 3 === 0 && y > 0) {
                // Front/back bracing
                for (let x = -currentOffset + 1; x < currentOffset; x++) {
                    result.push({ pos: [x, y, currentOffset], color: light });
                    result.push({ pos: [x, y, -currentOffset], color: light });
                }
                // Left/right bracing
                for (let z = -currentOffset + 1; z < currentOffset; z++) {
                    result.push({ pos: [currentOffset, y, z], color: light });
                    result.push({ pos: [-currentOffset, y, z], color: light });
                }
            }
        }
        
        // ============ FIRST PLATFORM ============
        const platform1Y = baseHeight;
        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                result.push({ pos: [x, platform1Y, z], color: rust });
            }
        }
        // Platform details
        for (let x = -5; x <= 5; x++) {
            result.push({ pos: [x, platform1Y + 1, 5], color: brown });
            result.push({ pos: [x, platform1Y + 1, -5], color: brown });
        }
        for (let z = -5; z <= 5; z++) {
            result.push({ pos: [5, platform1Y + 1, z], color: brown });
            result.push({ pos: [-5, platform1Y + 1, z], color: brown });
        }
        
        // ============ MIDDLE SECTION ============
        const midStart = platform1Y + 2;
        const midHeight = 20;
        
        for (let y = 0; y < midHeight; y++) {
            const narrowing = Math.floor(y / 4);
            const width = Math.max(1, 4 - narrowing);
            
            // Four columns
            const positions = [
                [width, width],
                [-width, width],
                [width, -width],
                [-width, -width],
            ];
            
            for (const [px, pz] of positions) {
                result.push({ pos: [px, midStart + y, pz], color: y % 2 === 0 ? brown : rust });
            }
            
            // Cross bracing
            if (y % 4 === 0) {
                for (let x = -width; x <= width; x++) {
                    result.push({ pos: [x, midStart + y, 0], color: light });
                    result.push({ pos: [0, midStart + y, x], color: light });
                }
            }
        }
        
        // ============ SECOND PLATFORM ============
        const platform2Y = midStart + midHeight;
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                result.push({ pos: [x, platform2Y, z], color: rust });
            }
        }
        
        // ============ UPPER SECTION ============
        const upperStart = platform2Y + 1;
        const upperHeight = 25;
        
        for (let y = 0; y < upperHeight; y++) {
            const width = Math.max(0, 2 - Math.floor(y / 6));
            
            if (width > 0) {
                const positions = [
                    [width, width],
                    [-width, width],
                    [width, -width],
                    [-width, -width],
                ];
                
                for (const [px, pz] of positions) {
                    result.push({ pos: [px, upperStart + y, pz], color: brown });
                }
            } else {
                // Single column at top
                result.push({ pos: [0, upperStart + y, 0], color: brown });
            }
        }
        
        // ============ ANTENNA ============
        const antennaStart = upperStart + upperHeight;
        for (let y = 0; y < 8; y++) {
            result.push({ pos: [0, antennaStart + y, 0], color: rust });
        }
        
        // Top beacon
        result.push({ pos: [0, antennaStart + 8, 0], color: '#ff0000' });
        
        return result;
    }, []);

    return (
        <group position={position}>
            {/* Tower voxels - no surface, uses ContinuousTerrain */}
            {voxels.map((v) => (
                <Voxel key={`${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

