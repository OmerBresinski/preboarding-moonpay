import { useMemo } from 'react';
import { COLORS } from '../../utils/voxelHelpers';

interface BurjKhalifaProps {
    position: [number, number, number];
}

// Single voxel cube
const Voxel = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

export const BurjKhalifa = ({ position }: BurjKhalifaProps) => {
    const voxels = useMemo(() => {
        const result: { pos: [number, number, number]; color: string }[] = [];
        
        const silver = COLORS.burjSilver;
        const glass = COLORS.burjGlass;
        const darkSilver = '#a0a0a0';
        
        // ============ BASE SECTION ============
        // Y-shaped footprint typical of Burj Khalifa
        const baseHeight = 20;
        
        for (let y = 0; y < baseHeight; y++) {
            const shrink = Math.floor(y / 5);
            const baseWidth = Math.max(2, 6 - shrink);
            
            // Main center column
            for (let x = -baseWidth; x <= baseWidth; x++) {
                for (let z = -2; z <= 2; z++) {
                    const isEdge = Math.abs(x) === baseWidth || Math.abs(z) === 2;
                    result.push({ 
                        pos: [x, y, z], 
                        color: isEdge ? silver : (y % 3 === 0 ? darkSilver : glass)
                    });
                }
            }
            
            // Wings (Y-shape extensions) - 3 wings at 120 degrees
            if (baseWidth > 3) {
                // Wing 1 - front
                for (let z = 3; z <= baseWidth; z++) {
                    result.push({ pos: [0, y, z], color: silver });
                    result.push({ pos: [-1, y, z], color: glass });
                    result.push({ pos: [1, y, z], color: glass });
                }
                
                // Wing 2 - back left
                for (let i = 1; i <= baseWidth - 2; i++) {
                    result.push({ pos: [-i - 2, y, -i], color: silver });
                    result.push({ pos: [-i - 1, y, -i], color: glass });
                }
                
                // Wing 3 - back right
                for (let i = 1; i <= baseWidth - 2; i++) {
                    result.push({ pos: [i + 2, y, -i], color: silver });
                    result.push({ pos: [i + 1, y, -i], color: glass });
                }
            }
        }
        
        // ============ MIDDLE SECTIONS ============
        // Multiple setback tiers
        const tiers = [
            { startY: baseHeight, height: 15, width: 4 },
            { startY: baseHeight + 15, height: 15, width: 3 },
            { startY: baseHeight + 30, height: 12, width: 2 },
            { startY: baseHeight + 42, height: 10, width: 1 },
        ];
        
        for (const tier of tiers) {
            for (let y = 0; y < tier.height; y++) {
                // Main shaft
                for (let x = -tier.width; x <= tier.width; x++) {
                    for (let z = -tier.width; z <= tier.width; z++) {
                        // Create window pattern
                        const isWindow = (x + y + z) % 2 === 0;
                        const isEdge = Math.abs(x) === tier.width || Math.abs(z) === tier.width;
                        result.push({ 
                            pos: [x, tier.startY + y, z], 
                            color: isEdge ? silver : (isWindow ? glass : darkSilver)
                        });
                    }
                }
            }
        }
        
        // ============ SPIRE ============
        const spireStart = baseHeight + 52;
        for (let y = 0; y < 25; y++) {
            // Tapering spire
            const width = Math.max(0, 1 - Math.floor(y / 10));
            
            if (width === 0) {
                result.push({ pos: [0, spireStart + y, 0], color: silver });
            } else {
                for (let x = -width; x <= width; x++) {
                    for (let z = -width; z <= width; z++) {
                        result.push({ pos: [x, spireStart + y, z], color: silver });
                    }
                }
            }
        }
        
        // Antenna tip
        for (let y = 0; y < 5; y++) {
            result.push({ pos: [0, spireStart + 25 + y, 0], color: darkSilver });
        }
        
        // Top light
        result.push({ pos: [0, spireStart + 30, 0], color: '#ff0000' });
        
        return result;
    }, []);

    // Pre-compute surrounding buildings
    const buildings = useMemo(() => {
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 9999) * 9999;
            return x - Math.floor(x);
        };
        return Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 40 + seededRandom(i * 5) * 20;
            const height = 10 + seededRandom(i * 5 + 1) * 20;
            return {
                id: `building-${i}`,
                position: [Math.cos(angle) * dist, height / 2, Math.sin(angle) * dist] as [number, number, number],
                size: [5 + seededRandom(i * 5 + 2) * 5, height, 5 + seededRandom(i * 5 + 3) * 5] as [number, number, number]
            };
        });
    }, []);

    return (
        <group position={position}>
            {/* Dubai fountain area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0, 0]} receiveShadow>
                <circleGeometry args={[25, 32]} />
                <meshStandardMaterial color={COLORS.water} transparent opacity={0.8} />
            </mesh>
            
            {/* Surrounding buildings (simplified) */}
            {buildings.map((b) => (
                <mesh key={b.id} position={b.position} castShadow>
                    <boxGeometry args={b.size} />
                    <meshStandardMaterial color="#8090a0" />
                </mesh>
            ))}
            
            {/* Tower voxels - uses ContinuousTerrain for ground */}
            {voxels.map((v) => (
                <Voxel key={`${v.pos[0]}-${v.pos[1]}-${v.pos[2]}`} position={v.pos} color={v.color} />
            ))}
        </group>
    );
};

