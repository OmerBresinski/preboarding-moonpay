import { useMemo } from 'react';
import { COLORS } from '../utils/voxelHelpers';
import { WaterSurface } from './WaterSurface';

// Terrain zones along X axis
// Zone 1: Water (Yacht & Statue of Liberty) - X: -infinity to 200
// Zone 2: Grass/Park (Eiffel Tower) - X: 200 to 400
// Zone 3: Desert (Burj Khalifa) - X: 400 to infinity
// ISS & Moon are in space (above the terrain)

export const ContinuousTerrain = () => {
    // Pre-compute terrain details
    const grassDetails = useMemo(() => {
        const details: Array<{ id: string; position: [number, number, number]; size: [number, number, number] }> = [];
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 12345) * 12345;
            return x - Math.floor(x);
        };
        
        // Grass patches and flowers
        for (let i = 0; i < 100; i++) {
            const x = 200 + seededRandom(i * 7) * 200;
            const z = (seededRandom(i * 7 + 1) - 0.5) * 400;
            details.push({
                id: `grass-${i}`,
                position: [x, -0.3, z],
                size: [2 + seededRandom(i * 7 + 2) * 3, 0.5, 2 + seededRandom(i * 7 + 3) * 3]
            });
        }
        
        return details;
    }, []);
    
    const desertDetails = useMemo(() => {
        const details: Array<{ id: string; position: [number, number, number]; size: [number, number, number]; color: string }> = [];
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 54321) * 54321;
            return x - Math.floor(x);
        };
        
        // Sand dunes
        for (let i = 0; i < 50; i++) {
            const x = 400 + seededRandom(i * 9) * 300;
            const z = (seededRandom(i * 9 + 1) - 0.5) * 400;
            details.push({
                id: `dune-${i}`,
                position: [x, seededRandom(i * 9 + 2) * 2, z],
                size: [5 + seededRandom(i * 9 + 3) * 10, 2 + seededRandom(i * 9 + 4) * 3, 5 + seededRandom(i * 9 + 5) * 10],
                color: '#d4a574'
            });
        }
        
        return details;
    }, []);
    
    const trees = useMemo(() => {
        const treeList: Array<{ id: string; position: [number, number, number] }> = [];
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 98765) * 98765;
            return x - Math.floor(x);
        };
        
        // Trees in park area
        for (let i = 0; i < 30; i++) {
            const x = 220 + seededRandom(i * 11) * 160;
            const z = (seededRandom(i * 11 + 1) - 0.5) * 300;
            // Avoid center where Eiffel Tower is
            if (Math.abs(z) > 30 || x < 280 || x > 320) {
                treeList.push({
                    id: `tree-${i}`,
                    position: [x, 0, z]
                });
            }
        }
        
        return treeList;
    }, []);

    return (
        <group>
            {/* === WATER ZONE (X: -1000 to 200) === */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-400, -3, 0]} receiveShadow>
                <planeGeometry args={[1200, 2000]} />
                <meshStandardMaterial color={COLORS.water} />
            </mesh>
            
            {/* Water surface effects - only in water zone */}
            <group position={[-200, 0, 0]}>
                <WaterSurface showBoats={true} boatCount={8} waveCount={60} />
            </group>
            
            {/* Beach transition (water to grass) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[185, -2, 0]} receiveShadow>
                <planeGeometry args={[30, 2000]} />
                <meshStandardMaterial color="#e0c9a9" />
            </mesh>
            
            {/* === GRASS/PARK ZONE (X: 200 to 400) === */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -1, 0]} receiveShadow>
                <planeGeometry args={[200, 2000]} />
                <meshStandardMaterial color="#4a7c4e" />
            </mesh>
            
            {/* Lighter grass patches */}
            {grassDetails.map((detail) => (
                <mesh key={detail.id} position={detail.position} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[detail.size[0], detail.size[2]]} />
                    <meshStandardMaterial color="#5a9c5e" />
                </mesh>
            ))}
            
            {/* Park paths */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -0.9, 0]} receiveShadow>
                <planeGeometry args={[150, 8]} />
                <meshStandardMaterial color="#8b7355" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -0.9, 0]} receiveShadow>
                <planeGeometry args={[8, 150]} />
                <meshStandardMaterial color="#8b7355" />
            </mesh>
            
            {/* Trees */}
            {trees.map((tree) => (
                <group key={tree.id} position={tree.position}>
                    {/* Trunk */}
                    <mesh position={[0, 3, 0]}>
                        <boxGeometry args={[1, 6, 1]} />
                        <meshStandardMaterial color="#5d4037" />
                    </mesh>
                    {/* Foliage */}
                    <mesh position={[0, 7, 0]}>
                        <boxGeometry args={[4, 5, 4]} />
                        <meshStandardMaterial color="#2e7d32" />
                    </mesh>
                    <mesh position={[0, 10, 0]}>
                        <boxGeometry args={[3, 3, 3]} />
                        <meshStandardMaterial color="#388e3c" />
                    </mesh>
                </group>
            ))}
            
            {/* Transition to desert */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[400, -1, 0]} receiveShadow>
                <planeGeometry args={[20, 2000]} />
                <meshStandardMaterial color="#a08060" />
            </mesh>
            
            {/* === DESERT ZONE (X: 400 to 1000) === */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[700, -1, 0]} receiveShadow>
                <planeGeometry args={[600, 2000]} />
                <meshStandardMaterial color="#c4a35a" />
            </mesh>
            
            {/* Sand dunes */}
            {desertDetails.map((dune) => (
                <mesh key={dune.id} position={dune.position}>
                    <boxGeometry args={dune.size} />
                    <meshStandardMaterial color={dune.color} />
                </mesh>
            ))}
            
            {/* Small oasis near Burj */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[550, -0.5, 30]} receiveShadow>
                <circleGeometry args={[15, 16]} />
                <meshStandardMaterial color="#3498db" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[550, -0.4, 30]} receiveShadow>
                <circleGeometry args={[20, 16]} />
                <meshStandardMaterial color="#2e7d32" />
            </mesh>
        </group>
    );
};

