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
    isFlying: boolean = false,
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
        drawJetpack(ctx, x, y, pixelSize, spriteData[0].length, spriteData.length, palette[1], time, isFlying);
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

// Draw jetpack with animated flames (positioned behind character)
const drawJetpack = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pixelSize: number,
    spriteWidth: number,
    spriteHeight: number,
    primaryColor: string,
    time: number,
    isFlying: boolean
): void => {
    // Jetpack position - centered on the character's back (slightly offset to look like it's behind)
    const jetpackWidth = pixelSize * 4;
    const jetpackX = x + (spriteWidth * pixelSize - jetpackWidth) / 2;
    const jetpackY = y + 8 * pixelSize;
    
    // Jetpack body (dark metal)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(jetpackX, jetpackY, jetpackWidth, pixelSize * 7);
    
    // Jetpack top cap
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(jetpackX + pixelSize * 0.5, jetpackY - pixelSize, jetpackWidth - pixelSize, pixelSize);
    
    // Jetpack tanks (left and right)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(jetpackX, jetpackY + pixelSize, pixelSize, pixelSize * 5);
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize, jetpackY + pixelSize, pixelSize, pixelSize * 5);
    
    // Jetpack accent stripe (character's color)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(jetpackX + pixelSize, jetpackY + pixelSize * 2, jetpackWidth - pixelSize * 2, pixelSize * 3);
    
    // Thruster nozzles at bottom
    ctx.fillStyle = '#222222';
    ctx.fillRect(jetpackX + pixelSize * 0.5, jetpackY + pixelSize * 7, pixelSize * 1.2, pixelSize);
    ctx.fillRect(jetpackX + jetpackWidth - pixelSize * 1.7, jetpackY + pixelSize * 7, pixelSize * 1.2, pixelSize);
    
    // Only draw flames when flying
    if (isFlying) {
        const flamePhase = (time / 50) % 1;
        const flameHeight1 = 4 + Math.sin(flamePhase * Math.PI * 2) * 2;
        const flameHeight2 = 4 + Math.sin((flamePhase + 0.5) * Math.PI * 2) * 2;
        
        const flameY = jetpackY + pixelSize * 8;
        const leftFlameX = jetpackX + pixelSize * 1.1;
        const rightFlameX = jetpackX + jetpackWidth - pixelSize * 1.1;
        
        // Outer flames (orange/red)
        ctx.fillStyle = '#FF6B00';
        
        // Left flame
        ctx.beginPath();
        ctx.moveTo(leftFlameX - pixelSize * 0.5, flameY);
        ctx.lineTo(leftFlameX + pixelSize * 0.5, flameY);
        ctx.lineTo(leftFlameX, flameY + pixelSize * flameHeight1);
        ctx.closePath();
        ctx.fill();
        
        // Right flame
        ctx.beginPath();
        ctx.moveTo(rightFlameX - pixelSize * 0.5, flameY);
        ctx.lineTo(rightFlameX + pixelSize * 0.5, flameY);
        ctx.lineTo(rightFlameX, flameY + pixelSize * flameHeight2);
        ctx.closePath();
        ctx.fill();
        
        // Inner flames (yellow/white core)
        ctx.fillStyle = '#FFDD00';
        
        // Left inner flame
        ctx.beginPath();
        ctx.moveTo(leftFlameX - pixelSize * 0.25, flameY);
        ctx.lineTo(leftFlameX + pixelSize * 0.25, flameY);
        ctx.lineTo(leftFlameX, flameY + pixelSize * (flameHeight1 * 0.65));
        ctx.closePath();
        ctx.fill();
        
        // Right inner flame
        ctx.beginPath();
        ctx.moveTo(rightFlameX - pixelSize * 0.25, flameY);
        ctx.lineTo(rightFlameX + pixelSize * 0.25, flameY);
        ctx.lineTo(rightFlameX, flameY + pixelSize * (flameHeight2 * 0.65));
        ctx.closePath();
        ctx.fill();
        
        // Flame particles
        ctx.fillStyle = '#FF9500';
        for (let i = 0; i < 4; i++) {
            const particlePhase = ((time / 80) + i * 0.25) % 1;
            const particleY = flameY + pixelSize * (3 + particlePhase * 5);
            const leftParticleX = leftFlameX + Math.sin(time / 80 + i) * pixelSize * 0.5;
            const rightParticleX = rightFlameX + Math.sin(time / 80 + i + 2) * pixelSize * 0.5;
            const particleSize = pixelSize * (1 - particlePhase) * 0.4;
            
            if (particleSize > 0) {
                ctx.beginPath();
                ctx.arc(leftParticleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(rightParticleX, particleY + pixelSize * 0.5, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};

// Get sprite dimensions
export const getSpriteSize = (preset: CharacterPreset, scale: number = 3): { width: number; height: number } => {
    return {
        width: preset.spriteData[0].length * scale,
        height: preset.spriteData.length * scale,
    };
};
