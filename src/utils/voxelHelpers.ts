import * as THREE from 'three';

// MoonPay brand colors
export const COLORS = {
    mpPurple: '#7D00FF',
    mpWhite: '#FFFFFF',
    mpDarkPurple: '#5a0099',
    
    // Statue of Liberty colors (like reference)
    statueGreen: '#3d8b6e',
    statueLightGreen: '#4fa882',
    statueDarkGreen: '#2d6b4e',
    statueBase: '#7a8a7a',
    statuePedestal: '#8a9a9a',
    torchFlame: '#ffd700',
    torchOrange: '#ff8c00',
    
    // Other landmark colors
    water: '#4a90a4',
    waterLight: '#6ab4c4',
    sky: '#87CEEB',
    ground: '#8B7355',
    sand: '#C2B280',
    metal: '#C0C0C0',
    
    // Yacht colors
    yachtWhite: '#f5f5f5',
    yachtBlue: '#1e3a5f',
    
    // Eiffel Tower
    eiffelBrown: '#8B4513',
    eiffelRust: '#6b4423',
    
    // Burj Khalifa
    burjSilver: '#C0C0C0',
    burjBlue: '#4169E1',
    burjGlass: '#87CEEB',
    
    // ISS
    issSolar: '#1a1a4e',
    issWhite: '#e8e8e8',
    
    // Moon
    moonGrey: '#BBBBBB',
    moonDark: '#888888',
    moonCrater: '#666666',
};

// Voxel data type
export interface VoxelData {
    position: [number, number, number];
    color: string;
}

// Create a voxel mesh from data
export const createVoxelGeometry = () => {
    return new THREE.BoxGeometry(1, 1, 1);
};

// Helper to generate voxel positions for basic shapes
export const generateBox = (
    x: number, y: number, z: number,
    width: number, height: number, depth: number,
    color: string
): VoxelData[] => {
    const voxels: VoxelData[] = [];
    for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
            for (let dz = 0; dz < depth; dz++) {
                voxels.push({
                    position: [x + dx, y + dy, z + dz],
                    color
                });
            }
        }
    }
    return voxels;
};

// Generate hollow box (only outer shell)
export const generateHollowBox = (
    x: number, y: number, z: number,
    width: number, height: number, depth: number,
    color: string
): VoxelData[] => {
    const voxels: VoxelData[] = [];
    for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
            for (let dz = 0; dz < depth; dz++) {
                // Only include outer shell
                if (dx === 0 || dx === width - 1 ||
                    dy === 0 || dy === height - 1 ||
                    dz === 0 || dz === depth - 1) {
                    voxels.push({
                        position: [x + dx, y + dy, z + dz],
                        color
                    });
                }
            }
        }
    }
    return voxels;
};

// Generate cylinder approximation with voxels
export const generateCylinder = (
    centerX: number, baseY: number, centerZ: number,
    radius: number, height: number,
    color: string
): VoxelData[] => {
    const voxels: VoxelData[] = [];
    for (let dy = 0; dy < height; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dz * dz <= radius * radius) {
                    voxels.push({
                        position: [centerX + dx, baseY + dy, centerZ + dz],
                        color
                    });
                }
            }
        }
    }
    return voxels;
};

// Generate sphere approximation with voxels
export const generateSphere = (
    centerX: number, centerY: number, centerZ: number,
    radius: number,
    color: string
): VoxelData[] => {
    const voxels: VoxelData[] = [];
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                    voxels.push({
                        position: [centerX + dx, centerY + dy, centerZ + dz],
                        color
                    });
                }
            }
        }
    }
    return voxels;
};

// Generate tapered column (wider at bottom)
export const generateTaperedColumn = (
    centerX: number, baseY: number, centerZ: number,
    baseRadius: number, topRadius: number, height: number,
    color: string
): VoxelData[] => {
    const voxels: VoxelData[] = [];
    for (let dy = 0; dy < height; dy++) {
        const t = dy / height;
        const radius = Math.round(baseRadius + (topRadius - baseRadius) * t);
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dz * dz <= radius * radius) {
                    voxels.push({
                        position: [centerX + dx, baseY + dy, centerZ + dz],
                        color
                    });
                }
            }
        }
    }
    return voxels;
};

// Convert hex color to THREE.Color
export const hexToThreeColor = (hex: string): THREE.Color => {
    return new THREE.Color(hex);
};

// Group voxels by color for instanced rendering
export const groupVoxelsByColor = (voxels: VoxelData[]): Map<string, THREE.Vector3[]> => {
    const groups = new Map<string, THREE.Vector3[]>();
    
    for (const voxel of voxels) {
        if (!groups.has(voxel.color)) {
            groups.set(voxel.color, []);
        }
        groups.get(voxel.color)!.push(new THREE.Vector3(...voxel.position));
    }
    
    return groups;
};

