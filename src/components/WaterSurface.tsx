import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { COLORS } from '../utils/voxelHelpers';

// Small voxel boat
const VoxelBoat = ({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bobOffset = useRef(Math.random() * Math.PI * 2);
    
    useFrame((state) => {
        if (groupRef.current) {
            // Gentle bobbing motion
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + bobOffset.current) * 0.3;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2 + bobOffset.current) * 0.05;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + bobOffset.current) * 0.03;
        }
    });
    
    return (
        <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
            {/* Hull */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[4, 1, 2]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[2, 0, 0]}>
                <boxGeometry args={[1, 0.8, 1.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[-2, 0, 0]}>
                <boxGeometry args={[1, 0.8, 1.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            
            {/* Cabin */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[2, 1.5, 1.5]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            
            {/* Mast */}
            <mesh position={[-1, 2.5, 0]}>
                <boxGeometry args={[0.2, 3, 0.2]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            
            {/* Sail */}
            <mesh position={[-1, 3, 0.5]}>
                <boxGeometry args={[0.1, 2, 1.5]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
        </group>
    );
};

// Cargo ship (bigger)
const CargoShip = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bobOffset = useRef(Math.random() * Math.PI * 2);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + bobOffset.current) * 0.4;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6 + bobOffset.current) * 0.02;
        }
    });
    
    return (
        <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
            {/* Hull */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[15, 3, 5]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[8, 0, 0]}>
                <boxGeometry args={[3, 2, 4]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            
            {/* Deck */}
            <mesh position={[0, 2, 0]}>
                <boxGeometry args={[14, 0.5, 4.5]} />
                <meshStandardMaterial color="#666666" />
            </mesh>
            
            {/* Containers */}
            {[-4, -1, 2].map((x) => (
                <group key={`container-${x}`} position={[x, 3, 0]}>
                    <mesh position={[0, 0, -1]}>
                        <boxGeometry args={[2.5, 2, 1.8]} />
                        <meshStandardMaterial color={x === -4 ? '#FF4444' : x === -1 ? '#4444FF' : '#44FF44'} />
                    </mesh>
                    <mesh position={[0, 0, 1]}>
                        <boxGeometry args={[2.5, 2, 1.8]} />
                        <meshStandardMaterial color={x === -4 ? '#FFFF44' : x === -1 ? '#FF44FF' : '#44FFFF'} />
                    </mesh>
                </group>
            ))}
            
            {/* Bridge */}
            <mesh position={[5, 4, 0]}>
                <boxGeometry args={[3, 3, 3]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[5, 5.5, 1]}>
                <boxGeometry args={[2.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#333366" />
            </mesh>
        </group>
    );
};

// Animated wave mesh
const AnimatedWave = ({ position, size, speed, phase }: { 
    position: [number, number, number]; 
    size: [number, number]; 
    speed: number;
    phase: number;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + phase) * 0.2;
            meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * speed * 0.5 + phase) * 0.1;
        }
    });
    
    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={size} />
            <meshStandardMaterial 
                color={COLORS.waterLight} 
                transparent 
                opacity={0.4}
            />
        </mesh>
    );
};

interface WaterSurfaceProps {
    showBoats?: boolean;
    boatCount?: number;
    waveCount?: number;
}

export const WaterSurface = ({ 
    showBoats = true, 
    boatCount = 4,
    waveCount = 30
}: WaterSurfaceProps) => {
    // Pre-compute boat positions
    const boats = useMemo(() => {
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 12345) * 12345;
            return x - Math.floor(x);
        };
        
        return Array.from({ length: boatCount }).map((_, i) => ({
            id: `boat-${i}`,
            position: [
                (seededRandom(i * 7) - 0.5) * 400,
                -2,
                (seededRandom(i * 7 + 1) - 0.5) * 400
            ] as [number, number, number],
            rotation: seededRandom(i * 7 + 2) * Math.PI * 2,
            scale: 0.8 + seededRandom(i * 7 + 3) * 0.5,
            isCargoShip: seededRandom(i * 7 + 4) > 0.7
        }));
    }, [boatCount]);
    
    // Pre-compute wave positions
    const waves = useMemo(() => {
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 54321) * 54321;
            return x - Math.floor(x);
        };
        
        return Array.from({ length: waveCount }).map((_, i) => ({
            id: `wave-${i}`,
            position: [
                (seededRandom(i * 5) - 0.5) * 600,
                -2.3,
                (seededRandom(i * 5 + 1) - 0.5) * 600
            ] as [number, number, number],
            size: [
                10 + seededRandom(i * 5 + 2) * 20,
                5 + seededRandom(i * 5 + 3) * 10
            ] as [number, number],
            speed: 0.5 + seededRandom(i * 5 + 4) * 1.5,
            phase: seededRandom(i * 5 + 5) * Math.PI * 2
        }));
    }, [waveCount]);

    return (
        <group>
            {/* Animated waves */}
            {waves.map((wave) => (
                <AnimatedWave 
                    key={wave.id}
                    position={wave.position}
                    size={wave.size}
                    speed={wave.speed}
                    phase={wave.phase}
                />
            ))}
            
            {/* Boats */}
            {showBoats && boats.map((boat) => (
                boat.isCargoShip ? (
                    <CargoShip 
                        key={boat.id}
                        position={boat.position}
                        rotation={boat.rotation}
                    />
                ) : (
                    <VoxelBoat 
                        key={boat.id}
                        position={boat.position}
                        rotation={boat.rotation}
                        scale={boat.scale}
                    />
                )
            ))}
        </group>
    );
};

