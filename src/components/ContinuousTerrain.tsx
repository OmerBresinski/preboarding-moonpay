import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { WaterSurface } from './WaterSurface';
import { shaderMaterial } from '@react-three/drei';

// Terrain zones along X axis
// Zone 1: Water (Yacht & Statue of Liberty) - X: -infinity to 200
// Zone 2: Grass/Park (Eiffel Tower) - X: 200 to 400
// Zone 3: Desert (Burj Khalifa) - X: 400 to infinity
// ISS & Moon are in space (above the terrain)

// Custom gradient terrain shader material
const GradientTerrainMaterial = shaderMaterial(
    {
        uTime: 0,
        // Zone boundaries (in world X coordinates, but we'll adjust for plane positioning)
        uWaterEnd: 200,
        uBeachEnd: 220,
        uGrassEnd: 400,
        uTransitionEnd: 430,
        // Colors
        uWaterColor: new THREE.Color('#1e88e5'),
        uBeachColor: new THREE.Color('#e0c9a9'),
        uGrassColor: new THREE.Color('#4a7c4e'),
        uDesertColor: new THREE.Color('#c4a35a'),
    },
    // Vertex shader
    `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    // Fragment shader
    `
        uniform float uTime;
        uniform float uWaterEnd;
        uniform float uBeachEnd;
        uniform float uGrassEnd;
        uniform float uTransitionEnd;
        uniform vec3 uWaterColor;
        uniform vec3 uBeachColor;
        uniform vec3 uGrassColor;
        uniform vec3 uDesertColor;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        // Smooth step for nice transitions
        float smoothBlend(float edge0, float edge1, float x) {
            float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
            return t * t * (3.0 - 2.0 * t);
        }
        
        void main() {
            float x = vWorldPosition.x;
            vec3 color;
            
            // Water zone
            if (x < uWaterEnd) {
                // Add subtle wave variation to water
                float wave = sin(x * 0.02 + uTime * 0.5) * 0.1 + sin(vWorldPosition.z * 0.03 + uTime * 0.3) * 0.1;
                color = uWaterColor * (1.0 + wave);
            }
            // Beach transition
            else if (x < uBeachEnd) {
                float t = smoothBlend(uWaterEnd, uBeachEnd, x);
                color = mix(uWaterColor, uBeachColor, t);
            }
            // Grass zone
            else if (x < uGrassEnd) {
                float grassT = smoothBlend(uBeachEnd, uBeachEnd + 30.0, x);
                vec3 baseGrass = mix(uBeachColor, uGrassColor, grassT);
                // Add some grass variation
                float variation = sin(x * 0.1) * 0.05 + sin(vWorldPosition.z * 0.15) * 0.05;
                color = baseGrass * (1.0 + variation);
            }
            // Grass to desert transition
            else if (x < uTransitionEnd) {
                float t = smoothBlend(uGrassEnd, uTransitionEnd, x);
                color = mix(uGrassColor, uDesertColor, t);
            }
            // Desert zone
            else {
                // Add dune-like variation
                float duneVariation = sin(x * 0.02) * 0.08 + sin(vWorldPosition.z * 0.025) * 0.06;
                color = uDesertColor * (1.0 + duneVariation);
            }
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
);

// Extend Three.js with our custom material
extend({ GradientTerrainMaterial });

// Animated terrain component
const GradientTerrain = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });
    
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -1, 0]} receiveShadow>
            <planeGeometry args={[1800, 2000]} />
            {/* @ts-expect-error - Custom shader material extended via drei */}
            <gradientTerrainMaterial ref={materialRef} />
        </mesh>
    );
};

export const ContinuousTerrain = () => {
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
    
    const desertDetails = useMemo(() => {
        const details: Array<{ id: string; position: [number, number, number]; size: [number, number, number]; color: string }> = [];
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 54321) * 54321;
            return x - Math.floor(x);
        };
        
        // Sand dunes (3D boxes that sit ON TOP of the terrain)
        for (let i = 0; i < 30; i++) {
            const x = 450 + seededRandom(i * 9) * 250;
            const z = (seededRandom(i * 9 + 1) - 0.5) * 400;
            const height = 1 + seededRandom(i * 9 + 4) * 2;
            details.push({
                id: `dune-${i}`,
                position: [x, height / 2, z],
                size: [5 + seededRandom(i * 9 + 3) * 10, height, 5 + seededRandom(i * 9 + 5) * 10],
                color: '#d4a574'
            });
        }
        
        return details;
    }, []);

    return (
        <group>
            {/* Single unified gradient terrain plane */}
            <GradientTerrain />
            
            {/* Water surface effects - only in water zone */}
            <group position={[-200, 0, 0]}>
                <WaterSurface showBoats={true} boatCount={8} waveCount={60} />
            </group>
            
            {/* Park paths (slightly elevated to avoid z-fighting) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -0.5, 0]} receiveShadow>
                <planeGeometry args={[150, 8]} />
                <meshStandardMaterial color="#8b7355" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[300, -0.5, 0]} receiveShadow>
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
            
            {/* Sand dunes (3D boxes on top of terrain) */}
            {desertDetails.map((dune) => (
                <mesh key={dune.id} position={dune.position}>
                    <boxGeometry args={dune.size} />
                    <meshStandardMaterial color={dune.color} />
                </mesh>
            ))}
            
            {/* Small oasis near Burj (elevated above terrain) */}
            <group position={[550, 0, 30]}>
                {/* Grass ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                    <ringGeometry args={[12, 20, 24]} />
                    <meshStandardMaterial color="#2e7d32" />
                </mesh>
                {/* Water pool */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
                    <circleGeometry args={[12, 24]} />
                    <meshStandardMaterial color="#3498db" />
                </mesh>
            </group>
        </group>
    );
};

