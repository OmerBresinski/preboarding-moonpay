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
};

// 16x24 pixel astronaut sprite template
// Each preset has slight variations in the design
const createAstronautSprite = (variant: 'classic' | 'cosmic' | 'nebula' | 'stellar' | 'lunar'): number[][] => {
    const sprites: Record<string, number[][]> = {
        classic: [
            // Row 0-2: Helmet top
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            // Row 3-5: Helmet with visor
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,1,4,4,4,4,4,4,1,2,0,0,0],
            [0,0,0,2,1,4,5,4,4,5,4,1,2,0,0,0],
            // Row 6-7: Helmet bottom
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
            // Row 8-11: Torso
            [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,6,6,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,3,3,1,1,3,3,1,1,0,0,0],
            // Row 12-14: Torso with arms
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0],
            [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
            // Row 15-16: Waist
            [0,0,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
            // Row 17-20: Legs
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
            // Row 21-23: Boots
            [0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
            [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
        ],
        cosmic: [
            // Cosmic variant - more rounded helmet, star emblem
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
            // Nebula variant - angular helmet, tech details
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
            // Stellar variant - sleek design, accent stripes
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
            // Lunar variant - moon-inspired, crater patterns
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
    };
    return sprites[variant];
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
    flipX: boolean = false
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
    
    for (let row = 0; row < spriteData.length; row++) {
        for (let col = 0; col < spriteData[row].length; col++) {
            const colorIndex = spriteData[row][col];
            if (colorIndex === 0) continue; // Skip transparent pixels
            
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

// Get sprite dimensions
export const getSpriteSize = (preset: CharacterPreset, scale: number = 3): { width: number; height: number } => {
    return {
        width: preset.spriteData[0].length * scale,
        height: preset.spriteData.length * scale,
    };
};

