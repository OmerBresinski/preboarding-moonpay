import { useMemo } from 'react';
import { COLORS } from '../../utils/voxelHelpers';

interface StatueOfLibertyProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const StatueOfLiberty = ({ position }: StatueOfLibertyProps) => {
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const green = COLORS.statueGreen;
        const lightGreen = COLORS.statueLightGreen;
        const darkGreen = COLORS.statueDarkGreen;
        const base = '#9a9a8a';
        const pedestal = '#8a8a7a';
        const torch = '#ffd700';
        const flame = '#ff8c00';
        
        // ============ PEDESTAL BASE ============
        // Large square base
        for (let x = -8; x <= 8; x++) {
            for (let z = -8; z <= 8; z++) {
                result.push({ pos: [x, 0, z], color: base });
                result.push({ pos: [x, 1, z], color: base });
            }
        }
        
        // Stepped pedestal
        for (let x = -6; x <= 6; x++) {
            for (let z = -6; z <= 6; z++) {
                result.push({ pos: [x, 2, z], color: pedestal });
                result.push({ pos: [x, 3, z], color: pedestal });
            }
        }
        
        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                for (let y = 4; y <= 8; y++) {
                    result.push({ pos: [x, y, z], color: pedestal });
                }
            }
        }
        
        // Upper pedestal
        for (let x = -4; x <= 4; x++) {
            for (let z = -4; z <= 4; z++) {
                for (let y = 9; y <= 12; y++) {
                    result.push({ pos: [x, y, z], color: base });
                }
            }
        }
        
        // ============ STATUE BODY ============
        const bodyBase = 13;
        
        // Feet / base of robe
        for (let x = -3; x <= 3; x++) {
            for (let z = -2; z <= 2; z++) {
                result.push({ pos: [x, bodyBase, z], color: darkGreen });
                result.push({ pos: [x, bodyBase + 1, z], color: darkGreen });
            }
        }
        
        // Lower robe - flowing shape
        for (let y = bodyBase + 2; y <= bodyBase + 10; y++) {
            const robeWidth = Math.max(1, 3 - Math.floor((y - bodyBase - 2) / 3));
            for (let x = -robeWidth; x <= robeWidth; x++) {
                for (let z = -2; z <= 2; z++) {
                    // Add variation for folds
                    const isFold = (x + z + y) % 3 === 0;
                    result.push({ pos: [x, y, z], color: isFold ? lightGreen : green });
                }
            }
            // Robe edges
            result.push({ pos: [-robeWidth - 1, y, 0], color: darkGreen });
            result.push({ pos: [robeWidth + 1, y, 0], color: darkGreen });
        }
        
        // Torso
        for (let y = bodyBase + 11; y <= bodyBase + 16; y++) {
            for (let x = -2; x <= 2; x++) {
                for (let z = -1; z <= 1; z++) {
                    result.push({ pos: [x, y, z], color: green });
                }
            }
        }
        
        // ============ LEFT ARM (raised with torch) ============
        // Shoulder
        result.push({ pos: [3, bodyBase + 15, 0], color: green });
        result.push({ pos: [3, bodyBase + 16, 0], color: green });
        
        // Upper arm going up
        for (let y = bodyBase + 17; y <= bodyBase + 25; y++) {
            result.push({ pos: [3, y, 0], color: green });
            result.push({ pos: [4, y, 0], color: lightGreen });
        }
        
        // Hand and torch base
        result.push({ pos: [3, bodyBase + 26, 0], color: lightGreen });
        result.push({ pos: [4, bodyBase + 26, 0], color: lightGreen });
        result.push({ pos: [3, bodyBase + 27, 0], color: lightGreen });
        result.push({ pos: [4, bodyBase + 27, 0], color: lightGreen });
        
        // Torch handle
        for (let y = bodyBase + 28; y <= bodyBase + 32; y++) {
            result.push({ pos: [3, y, 0], color: torch });
            result.push({ pos: [4, y, 0], color: torch });
        }
        
        // Torch cup
        for (let x = 2; x <= 5; x++) {
            for (let z = -1; z <= 1; z++) {
                result.push({ pos: [x, bodyBase + 33, z], color: torch });
            }
        }
        
        // Flame!
        result.push({ pos: [3, bodyBase + 34, 0], color: flame });
        result.push({ pos: [4, bodyBase + 34, 0], color: flame });
        result.push({ pos: [3, bodyBase + 35, 0], color: '#ffff00' });
        result.push({ pos: [4, bodyBase + 35, 0], color: '#ffff00' });
        result.push({ pos: [3, bodyBase + 36, 0], color: '#ffff00' });
        
        // ============ RIGHT ARM (holding tablet) ============
        // Shoulder
        result.push({ pos: [-3, bodyBase + 15, 0], color: green });
        result.push({ pos: [-3, bodyBase + 14, 0], color: green });
        
        // Arm bent holding tablet
        result.push({ pos: [-4, bodyBase + 13, 0], color: green });
        result.push({ pos: [-4, bodyBase + 12, 0], color: green });
        result.push({ pos: [-5, bodyBase + 11, 0], color: green });
        result.push({ pos: [-5, bodyBase + 12, 0], color: green });
        
        // Tablet
        for (let y = bodyBase + 10; y <= bodyBase + 14; y++) {
            result.push({ pos: [-6, y, 0], color: '#b8b8a0' });
            result.push({ pos: [-6, y, 1], color: '#b8b8a0' });
        }
        
        // ============ HEAD AND CROWN ============
        const headBase = bodyBase + 17;
        
        // Neck
        result.push({ pos: [0, headBase, 0], color: green });
        result.push({ pos: [1, headBase, 0], color: green });
        result.push({ pos: [-1, headBase, 0], color: green });
        
        // Head - face
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                for (let y = headBase + 1; y <= headBase + 4; y++) {
                    result.push({ pos: [x, y, z], color: green });
                }
            }
        }
        
        // Face details
        result.push({ pos: [0, headBase + 3, 2], color: darkGreen }); // nose
        result.push({ pos: [-1, headBase + 3, 1], color: darkGreen }); // eye
        result.push({ pos: [1, headBase + 3, 1], color: darkGreen }); // eye
        
        // ============ CROWN ============
        const crownBase = headBase + 5;
        
        // Crown base ring
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                if (Math.abs(x) === 2 || Math.abs(z) === 2) {
                    result.push({ pos: [x, crownBase, z], color: green });
                }
            }
        }
        
        // Crown spikes (7 rays)
        const spikePositions = [
            [0, 0, 2],   // front
            [0, 0, -2],  // back
            [2, 0, 0],   // right
            [-2, 0, 0],  // left
            [1, 0, 1],   // front-right
            [-1, 0, 1],  // front-left
            [1, 0, -1],  // back-right
        ];
        
        for (const [sx, , sz] of spikePositions) {
            for (let h = 0; h < 4; h++) {
                const spikeX = sx * (1 + h * 0.3);
                const spikeZ = sz * (1 + h * 0.3);
                result.push({ 
                    pos: [Math.round(spikeX), crownBase + 1 + h, Math.round(spikeZ)], 
                    color: lightGreen 
                });
            }
        }
        
        // ============ WATER / GROUND ============
        // Water around the base
        
        return result;
    }, []);

    return (
        <group position={position}>
            {/* Liberty Island - small island platform */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
                <circleGeometry args={[25, 32]} />
                <meshStandardMaterial color="#6b8b4a" />
            </mesh>
            
            {/* Statue voxels */}
            {voxels.map((v) => (
                <Voxel key={`${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

