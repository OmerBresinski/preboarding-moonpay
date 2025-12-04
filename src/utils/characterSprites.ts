// Pixel Sprite Character Presets
// All characters are MoonPay purple themed astronauts

export interface CharacterPreset {
    id: number;
    name: string;
    description: string;
    // Pixel art data: 16x24 grid, each number maps to a color index
    // 0 = transparent, 1+ = color from palette
    spriteData: number[][];
    // Color palette for this character
    palette: string[];
}

// MoonPay color palette variants
const MOONPAY_PALETTES = {
    classic: ['transparent', '#7D00FF', '#FFFFFF', '#5a0099', '#B366FF', '#2D004D', '#FFD700', '#FF6B6B'],
    cosmic: ['transparent', '#9933FF', '#E6E6FA', '#6600CC', '#CC99FF', '#1A0033', '#00FFFF', '#FF69B4'],
    nebula: ['transparent', '#8B5CF6', '#F0E6FF', '#6D28D9', '#C4B5FD', '#3B0764', '#10B981', '#F59E0B'],
    stellar: ['transparent', '#A855F7', '#FAFAFA', '#7C3AED', '#DDD6FE', '#4C1D95', '#22D3EE', '#FB7185'],
    lunar: ['transparent', '#6366F1', '#E0E7FF', '#4F46E5', '#A5B4FC', '#312E81', '#FCD34D', '#34D399'],
    // New palettes
    solar: ['transparent', '#F59E0B', '#FEF3C7', '#D97706', '#FCD34D', '#78350F', '#EF4444', '#F97316'],
    arctic: ['transparent', '#06B6D4', '#ECFEFF', '#0891B2', '#67E8F9', '#164E63', '#A5F3FC', '#FFFFFF'],
    crimson: ['transparent', '#DC2626', '#FEE2E2', '#991B1B', '#FCA5A5', '#450A0A', '#F59E0B', '#FBBF24'],
    emerald: ['transparent', '#059669', '#D1FAE5', '#047857', '#6EE7B7', '#022C22', '#34D399', '#A7F3D0'],
    midnight: ['transparent', '#1E1B4B', '#C7D2FE', '#312E81', '#818CF8', '#0F0D24', '#6366F1', '#A5B4FC'],
};

// 16x24 pixel astronaut sprite template
const createAstronautSprite = (variant: string): number[][] => {
    const sprites: Record<string, number[][]> = {
        classic: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,5,4,4,5,4,1,2,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,6,6,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        cosmic: [
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,2,1,4,6,4,4,4,4,6,4,1,2,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,6,7,7,6,1,1,1,0,0,0],
            [0,0,1,1,1,1,7,6,6,7,1,1,1,1,0,0],
            [0,0,1,1,3,1,1,1,1,1,1,3,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,2,2,1,1,1,1,1,1,1,1,2,2,1,1],
            [1,2,2,2,1,1,1,1,1,1,1,1,2,2,2,1],
            [0,2,2,0,1,1,1,1,1,1,1,1,0,2,2,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,3,3,3,3,3,0,0,3,3,3,3,3,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
        ],
        nebula: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,2,1,4,5,5,4,4,5,5,4,1,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,1,1,6,1,1,6,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,7,1,1,1,1,7,1,1,1,0,0],
            [0,0,1,1,3,3,1,1,1,1,3,3,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1],
            [0,2,2,1,1,1,1,1,1,1,1,1,1,2,2,0],
            [0,2,0,1,1,1,1,1,1,1,1,1,1,0,2,0],
            [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,6,1,0,0,1,6,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
        ],
        stellar: [
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,2,1,4,7,4,4,4,4,7,4,1,2,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,0,6,1,1,1,1,1,1,1,1,6,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,6,1,1,1,1,1,1,1,1,1,1,6,0,0],
            [0,0,1,1,3,3,1,1,1,1,3,3,1,1,0,0],
            [0,6,1,1,1,1,1,1,1,1,1,1,1,1,6,0],
            [6,1,2,2,1,1,1,1,1,1,1,1,2,2,1,6],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,6,1,1,1,0,0,1,1,1,6,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,6,1,1,1,0,0,1,1,1,6,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        lunar: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,6,2,2,6,2,2,0,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,5,4,4,5,4,1,2,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,6,6,1,1,1,0,0,0,0],
            [0,0,0,1,1,6,1,1,1,1,6,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,6,1,1,1,1,6,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,6,1,0,0,1,6,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,6,2,0,0,2,6,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        // New variants
        solar: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,6,2,2,6,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,6,4,4,6,4,1,2,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,6,7,7,6,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        arctic: [
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,7,2,2,7,2,2,2,0,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,2,1,4,6,4,4,4,4,6,4,1,2,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,7,1,1,7,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,1,1,3,3,1,1,1,1,3,3,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,2,2,1,1,1,1,1,1,1,1,2,2,1,1],
            [1,2,2,2,1,1,1,1,1,1,1,1,2,2,2,1],
            [0,2,2,0,1,1,1,1,1,1,1,1,0,2,2,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
            [0,0,3,3,3,3,3,0,0,3,3,3,3,3,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
            [0,0,2,2,2,2,2,0,0,2,2,2,2,2,0,0],
        ],
        crimson: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,6,4,4,6,4,1,2,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,6,6,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        emerald: [
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,6,2,2,6,2,2,2,0,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,2,1,4,4,4,4,4,4,4,4,1,2,0,0],
            [0,0,2,1,4,7,4,4,4,4,7,4,1,2,0,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,0,6,1,1,1,1,1,1,1,1,6,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,6,1,1,1,1,1,1,1,1,1,1,6,0,0],
            [0,0,1,1,3,3,1,1,1,1,3,3,1,1,0,0],
            [0,6,1,1,1,1,1,1,1,1,1,1,1,1,6,0],
            [6,1,2,2,1,1,1,1,1,1,1,1,2,2,1,6],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,6,1,1,1,0,0,1,1,1,6,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,6,1,1,1,0,0,1,1,1,6,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        midnight: [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,2,6,6,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,7,4,4,7,4,1,2,0,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,6,6,1,1,1,0,0,0,0],
            [0,0,0,1,1,7,1,1,1,1,7,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,7,1,1,1,1,7,1,2,2,1,0],
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,7,1,0,0,1,7,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,7,2,0,0,2,7,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
    };
    return sprites[variant] || sprites['classic'];
};

export const CHARACTER_PRESETS: CharacterPreset[] = [
    {
        id: 0,
        name: 'Commander',
        description: 'Classic MoonPay astronaut, ready for the mission',
        spriteData: createAstronautSprite('classic'),
        palette: MOONPAY_PALETTES.classic,
    },
    {
        id: 1,
        name: 'Voyager',
        description: 'Cosmic explorer with a flair for adventure',
        spriteData: createAstronautSprite('cosmic'),
        palette: MOONPAY_PALETTES.cosmic,
    },
    {
        id: 2,
        name: 'Pioneer',
        description: 'Tech-enhanced suit for the modern space age',
        spriteData: createAstronautSprite('nebula'),
        palette: MOONPAY_PALETTES.nebula,
    },
    {
        id: 3,
        name: 'Nova',
        description: 'Sleek and stylish, built for speed',
        spriteData: createAstronautSprite('stellar'),
        palette: MOONPAY_PALETTES.stellar,
    },
    {
        id: 4,
        name: 'Lunar',
        description: 'Moon-themed suit with crater patterns',
        spriteData: createAstronautSprite('lunar'),
        palette: MOONPAY_PALETTES.lunar,
    },
    // New characters
    {
        id: 5,
        name: 'Solar',
        description: 'Powered by the sun, radiating warmth',
        spriteData: createAstronautSprite('solar'),
        palette: MOONPAY_PALETTES.solar,
    },
    {
        id: 6,
        name: 'Arctic',
        description: 'Cool and collected, ice in their veins',
        spriteData: createAstronautSprite('arctic'),
        palette: MOONPAY_PALETTES.arctic,
    },
    {
        id: 7,
        name: 'Phoenix',
        description: 'Rising from the flames, unstoppable',
        spriteData: createAstronautSprite('crimson'),
        palette: MOONPAY_PALETTES.crimson,
    },
    {
        id: 8,
        name: 'Emerald',
        description: 'Nature\'s champion in the cosmos',
        spriteData: createAstronautSprite('emerald'),
        palette: MOONPAY_PALETTES.emerald,
    },
    {
        id: 9,
        name: 'Midnight',
        description: 'One with the void, master of darkness',
        spriteData: createAstronautSprite('midnight'),
        palette: MOONPAY_PALETTES.midnight,
    },
];

export const getCharacterPreset = (id: number): CharacterPreset => {
    return CHARACTER_PRESETS[id] || CHARACTER_PRESETS[0];
};

// Draw character sprite to canvas at given position and scale
export const drawCharacterSprite = (
    ctx: CanvasRenderingContext2D,
    preset: CharacterPreset,
    x: number,
    y: number,
    scale: number = 3,
    flipX: boolean = false,
    _isFlying: boolean = false, // Kept for API compatibility, flames always on now
    time: number = 0,
    showJetpack: boolean = true
): void => {
    const { spriteData, palette } = preset;
    const pixelSize = scale;
    
    ctx.save();
    
    if (flipX) {
        ctx.translate(x + spriteData[0].length * pixelSize, y);
        ctx.scale(-1, 1);
        x = 0;
        y = 0;
    }
    
    // Draw jetpack BEHIND the character (drawn first so character overlaps)
    if (showJetpack) {
        drawJetpack(ctx, x, y, pixelSize, spriteData[0].length, palette[1], time);
    }
    
    // Draw character sprite
    for (let row = 0; row < spriteData.length; row++) {
        for (let col = 0; col < spriteData[row].length; col++) {
            const colorIndex = spriteData[row][col];
            if (colorIndex === 0) continue;
            
            const color = palette[colorIndex];
            if (color === 'transparent') continue;
            
            ctx.fillStyle = color;
            ctx.fillRect(
                x + col * pixelSize,
                y + row * pixelSize,
                pixelSize,
                pixelSize
            );
        }
    }
    
    ctx.restore();
};

// Draw jetpack with animated flames (positioned behind character, visible from multiple angles)
const drawJetpack = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pixelSize: number,
    spriteWidth: number,
    primaryColor: string,
    time: number
): void => {
    const charWidth = spriteWidth * pixelSize;
    const charCenterX = x + charWidth / 2;
    
    // === JETPACK BODY (much bigger, extends above head and below legs) ===
    const jetpackWidth = pixelSize * 10;
    const jetpackX = charCenterX - jetpackWidth / 2;
    const jetpackTopY = y + 2 * pixelSize; // Starts near top of head
    const jetpackHeight = pixelSize * 22; // Extends well below the character
    
    // Main jetpack frame (dark metal)
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(jetpackX, jetpackTopY, jetpackWidth, jetpackHeight);
    
    // === FUEL TANKS (large cylindrical tanks on sides) ===
    const tankWidth = pixelSize * 3;
    const tankHeight = pixelSize * 14;
    const tankY = jetpackTopY + pixelSize * 2;
    
    // Left tank
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(jetpackX - tankWidth + pixelSize, tankY, tankWidth, tankHeight);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(jetpackX - tankWidth + pixelSize, tankY, tankWidth, pixelSize * 2); // Tank cap
    ctx.fillStyle = primaryColor;
    ctx.fillRect(jetpackX - tankWidth + pixelSize + pixelSize * 0.5, tankY + pixelSize * 3, tankWidth - pixelSize, pixelSize * 8); // Tank window/gauge
    
    // Right tank
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize, tankY, tankWidth, tankHeight);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize, tankY, tankWidth, pixelSize * 2); // Tank cap
    ctx.fillStyle = primaryColor;
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize + pixelSize * 0.5, tankY + pixelSize * 3, tankWidth - pixelSize, pixelSize * 8); // Tank window/gauge
    
    // === STRAPS (visible wrapping around character) ===
    ctx.fillStyle = '#1a1a1a';
    // Top strap (across shoulders/chest area)
    ctx.fillRect(x - pixelSize, y + pixelSize * 6, pixelSize * 2, pixelSize);
    ctx.fillRect(x + charWidth - pixelSize, y + pixelSize * 6, pixelSize * 2, pixelSize);
    // Diagonal straps going to shoulders
    ctx.fillRect(jetpackX, jetpackTopY + pixelSize * 4, pixelSize * 2, pixelSize);
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize * 2, jetpackTopY + pixelSize * 4, pixelSize * 2, pixelSize);
    // Waist strap
    ctx.fillRect(x - pixelSize, y + pixelSize * 12, pixelSize * 2, pixelSize);
    ctx.fillRect(x + charWidth - pixelSize, y + pixelSize * 12, pixelSize * 2, pixelSize);
    // Strap buckles (metallic)
    ctx.fillStyle = '#666666';
    ctx.fillRect(x - pixelSize * 0.5, y + pixelSize * 5.5, pixelSize, pixelSize * 2);
    ctx.fillRect(x + charWidth - pixelSize * 0.5, y + pixelSize * 5.5, pixelSize, pixelSize * 2);
    ctx.fillRect(x - pixelSize * 0.5, y + pixelSize * 11.5, pixelSize, pixelSize * 2);
    ctx.fillRect(x + charWidth - pixelSize * 0.5, y + pixelSize * 11.5, pixelSize, pixelSize * 2);
    
    // === CENTRAL BODY DETAILS ===
    // Main accent panel
    ctx.fillStyle = primaryColor;
    ctx.fillRect(jetpackX + pixelSize * 2, jetpackTopY + pixelSize * 3, jetpackWidth - pixelSize * 4, pixelSize * 6);
    
    // Control panel / vents
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(jetpackX + pixelSize * 3, jetpackTopY + pixelSize * 10, jetpackWidth - pixelSize * 6, pixelSize * 4);
    // Vent lines
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(jetpackX + pixelSize * 3.5, jetpackTopY + pixelSize * (10.5 + i * 1.2), jetpackWidth - pixelSize * 7, pixelSize * 0.6);
    }
    
    // === THRUSTER SECTION (extends below character legs) ===
    const thrusterY = jetpackTopY + jetpackHeight - pixelSize * 6;
    
    // Thruster housing
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(jetpackX - pixelSize, thrusterY, jetpackWidth + pixelSize * 2, pixelSize * 6);
    
    // Left thruster nozzle
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(jetpackX - tankWidth + pixelSize * 2, thrusterY + pixelSize * 2, pixelSize * 3, pixelSize * 5);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(jetpackX - tankWidth + pixelSize * 2.5, thrusterY + pixelSize * 5, pixelSize * 2, pixelSize * 2);
    
    // Right thruster nozzle
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize, thrusterY + pixelSize * 2, pixelSize * 3, pixelSize * 5);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize * 0.5, thrusterY + pixelSize * 5, pixelSize * 2, pixelSize * 2);
    
    // Center thruster nozzle (bigger)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(charCenterX - pixelSize * 2.5, thrusterY + pixelSize * 3, pixelSize * 5, pixelSize * 5);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(charCenterX - pixelSize * 2, thrusterY + pixelSize * 6, pixelSize * 4, pixelSize * 2);
    
    // === FLAMES (centered under the main jetpack body) ===
    const flamePhase = (time / 40) % 1;
    const flameY = thrusterY + pixelSize * 8;
    
    // Flame heights - reduced size
    const leftFlameH = 5 + Math.sin(flamePhase * Math.PI * 2) * 2;
    const rightFlameH = 5 + Math.sin((flamePhase + 0.5) * Math.PI * 2) * 2;
    const centerFlameH = 7 + Math.sin((flamePhase + 0.25) * Math.PI * 2) * 2.5;
    
    // Centered flame positions (closer together under the main body)
    const leftFlameX = charCenterX - pixelSize * 2.5;
    const rightFlameX = charCenterX + pixelSize * 2.5;
    
    // Outer flames (red/orange)
    ctx.fillStyle = '#FF4500';
    
    // Left flame
    ctx.beginPath();
    ctx.moveTo(leftFlameX - pixelSize, flameY);
    ctx.lineTo(leftFlameX + pixelSize, flameY);
    ctx.lineTo(leftFlameX, flameY + pixelSize * leftFlameH);
    ctx.closePath();
    ctx.fill();
    
    // Right flame
    ctx.beginPath();
    ctx.moveTo(rightFlameX - pixelSize, flameY);
    ctx.lineTo(rightFlameX + pixelSize, flameY);
    ctx.lineTo(rightFlameX, flameY + pixelSize * rightFlameH);
    ctx.closePath();
    ctx.fill();
    
    // Center flame (main flame)
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.moveTo(charCenterX - pixelSize * 1.5, flameY);
    ctx.lineTo(charCenterX + pixelSize * 1.5, flameY);
    ctx.lineTo(charCenterX, flameY + pixelSize * centerFlameH);
    ctx.closePath();
    ctx.fill();
    
    // Inner flames (yellow core)
    ctx.fillStyle = '#FFD700';
    
    ctx.beginPath();
    ctx.moveTo(leftFlameX - pixelSize * 0.5, flameY);
    ctx.lineTo(leftFlameX + pixelSize * 0.5, flameY);
    ctx.lineTo(leftFlameX, flameY + pixelSize * (leftFlameH * 0.6));
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(rightFlameX - pixelSize * 0.5, flameY);
    ctx.lineTo(rightFlameX + pixelSize * 0.5, flameY);
    ctx.lineTo(rightFlameX, flameY + pixelSize * (rightFlameH * 0.6));
    ctx.closePath();
    ctx.fill();
    
    // Center inner flame (bright yellow)
    ctx.fillStyle = '#FFFF44';
    ctx.beginPath();
    ctx.moveTo(charCenterX - pixelSize * 0.8, flameY);
    ctx.lineTo(charCenterX + pixelSize * 0.8, flameY);
    ctx.lineTo(charCenterX, flameY + pixelSize * (centerFlameH * 0.55));
    ctx.closePath();
    ctx.fill();
    
    // Flame particles - fewer and centered
    ctx.fillStyle = '#FF9500';
    for (let i = 0; i < 4; i++) {
        const particlePhase = ((time / 60) + i * 0.25) % 1;
        const particleY = flameY + pixelSize * (3 + particlePhase * 5);
        const xOffset = Math.sin(time / 60 + i * 2) * pixelSize * 0.8;
        const particleSize = pixelSize * (1 - particlePhase) * 0.5;
        
        if (particleSize > 0) {
            ctx.beginPath();
            ctx.arc(charCenterX + xOffset, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Subtle glow effect
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = pixelSize * 2;
    ctx.fillStyle = 'rgba(255, 107, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(charCenterX, flameY + pixelSize * 3, pixelSize * 3, pixelSize * 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
};

// Get sprite dimensions
export const getSpriteSize = (preset: CharacterPreset, scale: number = 3): { width: number; height: number } => {
    return {
        width: preset.spriteData[0].length * scale,
        height: preset.spriteData.length * scale,
    };
};
