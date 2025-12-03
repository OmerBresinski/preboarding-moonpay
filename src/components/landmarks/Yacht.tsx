import { useMemo } from 'react';
import { COLORS } from '../../utils/voxelHelpers';

interface YachtProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const Yacht = ({ position }: YachtProps) => {
    // Build yacht voxels procedurally
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string; id: string }[] = [];
        
        // Hull - curved bottom shape
        // Main hull body (white with purple accents - MoonPay themed)
        for (let x = -10; x <= 10; x++) {
            const width = Math.max(0, 4 - Math.abs(x) * 0.3);
            for (let z = -Math.floor(width); z <= Math.floor(width); z++) {
                // Bottom hull curve
                const depth = Math.max(0, 2 - Math.abs(x) * 0.15);
                for (let y = -Math.floor(depth); y <= 0; y++) {
                    result.push({ pos: [x, y, z], color: COLORS.mpWhite, id: `hull-${x}-${y}-${z}` });
                }
            }
        }
        
        // Deck level
        for (let x = -9; x <= 9; x++) {
            const width = Math.max(0, 3.5 - Math.abs(x) * 0.25);
            for (let z = -Math.floor(width); z <= Math.floor(width); z++) {
                result.push({ pos: [x, 1, z], color: '#f5f0e6', id: `deck-${x}-${z}` }); // Deck wood color
            }
        }
        
        // Purple stripe along the side (MoonPay branding)
        for (let x = -8; x <= 8; x++) {
            const width = Math.max(0, 3 - Math.abs(x) * 0.25);
            result.push({ pos: [x, 0, Math.floor(width) + 1], color: COLORS.mpPurple, id: `stripe-f-${x}` });
            result.push({ pos: [x, 0, -Math.floor(width) - 1], color: COLORS.mpPurple, id: `stripe-b-${x}` });
        }
        
        // Cabin structure
        for (let x = -4; x <= 4; x++) {
            for (let z = -2; z <= 2; z++) {
                result.push({ pos: [x, 2, z], color: COLORS.mpWhite, id: `cabin1-${x}-${z}` });
                result.push({ pos: [x, 3, z], color: COLORS.mpWhite, id: `cabin2-${x}-${z}` });
            }
        }
        
        // Cabin roof
        for (let x = -4; x <= 4; x++) {
            for (let z = -2; z <= 2; z++) {
                result.push({ pos: [x, 4, z], color: '#e8e8e8', id: `roof-${x}-${z}` });
            }
        }
        
        // Windows (purple glass - MoonPay themed)
        for (let x = -3; x <= 3; x += 2) {
            result.push({ pos: [x, 3, 3], color: COLORS.mpPurple, id: `window-f-${x}` });
            result.push({ pos: [x, 3, -3], color: COLORS.mpPurple, id: `window-b-${x}` });
        }
        
        // Upper deck / flybridge
        for (let x = -2; x <= 2; x++) {
            for (let z = -1; z <= 1; z++) {
                result.push({ pos: [x, 5, z], color: '#f5f0e6', id: `upper-${x}-${z}` });
            }
        }
        
        // Captain's area
        result.push({ pos: [0, 6, 0], color: COLORS.mpWhite, id: 'cap-0' });
        result.push({ pos: [1, 6, 0], color: COLORS.mpWhite, id: 'cap-1' });
        result.push({ pos: [-1, 6, 0], color: COLORS.mpWhite, id: 'cap-2' });
        
        // Railings
        for (let x = -9; x <= 9; x += 2) {
            const width = Math.max(0, 3 - Math.abs(x) * 0.25);
            if (width > 0) {
                result.push({ pos: [x, 2, Math.floor(width) + 1], color: '#c0c0c0', id: `rail-f-${x}` });
                result.push({ pos: [x, 2, -Math.floor(width) - 1], color: '#c0c0c0', id: `rail-b-${x}` });
            }
        }
        
        // Bow (front) accent
        result.push({ pos: [10, 1, 0], color: COLORS.mpPurple, id: 'bow-1' });
        result.push({ pos: [11, 1, 0], color: COLORS.mpPurple, id: 'bow-2' });
        
        // Navigation lights
        result.push({ pos: [11, 2, 0], color: '#ffffff', id: 'nav-mast' }); // Mast light
        result.push({ pos: [-9, 1, 3], color: '#ff0000', id: 'nav-port' }); // Port (red)
        result.push({ pos: [-9, 1, -3], color: '#00ff00', id: 'nav-starb' }); // Starboard (green)
        
        // MoonPay logo area (simplified M shape on side)
        const logoX = 5;
        result.push({ pos: [logoX, 2, 4], color: COLORS.mpPurple, id: 'logo-1' });
        result.push({ pos: [logoX + 1, 3, 4], color: COLORS.mpPurple, id: 'logo-2' });
        result.push({ pos: [logoX + 2, 2, 4], color: COLORS.mpPurple, id: 'logo-3' });
        
        return result;
    }, []);

    return (
        <group position={position}>
            {/* Yacht voxels - no surface, uses ContinuousTerrain */}
            {voxels.map((v) => (
                <Voxel key={v.id} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};
